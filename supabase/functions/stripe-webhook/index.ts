import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import Stripe from 'npm:stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      event = JSON.parse(body);
    }

    console.log('Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.order_id || session.client_reference_id;

      if (!orderId) {
        console.error('No order ID found in session');
        return new Response(
          JSON.stringify({ error: 'No order ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentIntent = session.payment_intent as string;
      const amountTotal = session.amount_total;
      const currency = session.currency;

      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'confirmed',
          payment_transaction_id: paymentIntent,
          payment_gateway_response: session,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (product && product.stock >= item.quantity) {
            await supabaseAdmin
              .from('products')
              .update({ stock: product.stock - item.quantity })
              .eq('id', item.product_id);
          }
        }
      }

      console.log(`Order ${orderId} marked as completed`);
    }

    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.order_id || session.client_reference_id;

      if (orderId) {
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        console.log(`Order ${orderId} marked as failed`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});