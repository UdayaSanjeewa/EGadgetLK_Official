export interface PaymentGatewayConfig {
  apiKey: string;
  merchantId: string;
  apiUrl: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  transactionId?: string;
  status?: string;
  message?: string;
  error?: string;
}

export class PaymentGatewayService {
  private config: PaymentGatewayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_API_KEY || '',
      merchantId: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_MERCHANT_ID || '',
      apiUrl: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_API_URL || '',
      returnUrl: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancelUrl: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_CANCEL_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      notifyUrl: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_NOTIFY_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/payment-webhook`,
    };
  }

  async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.config.apiKey || !this.config.merchantId || !this.config.apiUrl) {
        throw new Error('Payment gateway not configured');
      }

      const payload = {
        merchant_id: this.config.merchantId,
        order_id: paymentData.orderId,
        order_number: paymentData.orderNumber,
        amount: paymentData.amount,
        currency: paymentData.currency,
        customer_name: paymentData.customerName,
        customer_email: paymentData.customerEmail,
        customer_mobile: paymentData.customerMobile,
        description: paymentData.description,
        return_url: this.config.returnUrl,
        cancel_url: this.config.cancelUrl,
        notify_url: this.config.notifyUrl,
      };

      const response = await fetch(`${this.config.apiUrl}/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment initiation failed');
      }

      const data = await response.json();

      return {
        success: true,
        paymentId: data.payment_id,
        paymentUrl: data.payment_url,
        transactionId: data.transaction_id,
        status: data.status,
      };
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate payment',
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      if (!this.config.apiKey || !this.config.merchantId || !this.config.apiUrl) {
        throw new Error('Payment gateway not configured');
      }

      const response = await fetch(`${this.config.apiUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          payment_id: paymentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const data = await response.json();

      return {
        success: data.status === 'SUCCESS' || data.status === 'COMPLETED',
        paymentId: data.payment_id,
        transactionId: data.transaction_id,
        status: data.status,
        message: data.message,
      };
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment',
      };
    }
  }

  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.merchantId &&
      this.config.apiUrl
    );
  }
}

export const paymentGateway = new PaymentGatewayService();
