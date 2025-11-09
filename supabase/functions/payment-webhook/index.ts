import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const webhookData = await req.json();

    console.log('Payment webhook received:', webhookData);

    const { 
      payment_id, 
      transaction_id, 
      order_id, 
      status, 
      amount, 
      currency,
      payment_method,
      signature 
    } = webhookData;

    if (!payment_id || !order_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentStatus = status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'COMPLETED'
      ? 'completed'
      : status.toUpperCase() === 'PENDING'
      ? 'pending'
      : 'failed';

    const orderStatus = paymentStatus === 'completed' ? 'confirmed' : 'pending';

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        payment_transaction_id: transaction_id,
        payment_gateway_response: webhookData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (orderError) {
      console.error('Error updating order:', orderError);
      throw orderError;
    }

    if (paymentStatus === 'completed') {
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order_id);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await supabaseAdmin.rpc('decrement_product_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        payment_status: paymentStatus,
        order_status: orderStatus
      }),
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