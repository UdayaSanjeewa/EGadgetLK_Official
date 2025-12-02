import Stripe from 'npm:stripe@14.21.0';

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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const {
      orderId,
      orderNumber,
      amount,
      currency,
      customerName,
      customerEmail,
      items,
    } = await req.json();

    if (!orderId || !amount || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: currency.toLowerCase() || 'lkr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.amount),
      },
      quantity: item.quantity,
    }));

    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${appUrl}/payment/cancel?order_id=${orderId}`,
      customer_email: customerEmail,
      client_reference_id: orderId,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});