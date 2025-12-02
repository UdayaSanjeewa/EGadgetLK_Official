import { loadStripe } from '@stripe/stripe-js';

export interface StripePaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    amount: number;
    quantity: number;
    image?: string;
  }>;
}

export interface StripePaymentResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};

export class StripePaymentService {
  isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );
  }

  async createCheckoutSession(paymentData: StripePaymentRequest): Promise<StripePaymentResponse> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Stripe is not configured. Please add your Stripe keys to environment variables.');
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      return {
        success: true,
        sessionId: data.sessionId,
      };
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create checkout session',
      };
    }
  }

  async redirectToCheckout(sessionId: string): Promise<{ error?: string }> {
    try {
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      console.error('Stripe redirect error:', error);
      return { error: error.message || 'Failed to redirect to checkout' };
    }
  }
}

export const stripePayment = new StripePaymentService();
