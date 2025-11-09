# Payment Gateway Configuration Guide

This guide explains how to configure the card payment system for your e-commerce application.

## Overview

The payment system supports:
- **Card Payment** - Credit/Debit card payments through payment gateway
- **Cash on Delivery** - Pay upon receiving the order

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Payment Gateway Configuration
NEXT_PUBLIC_PAYMENT_GATEWAY_API_KEY=your_api_key_here
NEXT_PUBLIC_PAYMENT_GATEWAY_MERCHANT_ID=your_merchant_id_here
NEXT_PUBLIC_PAYMENT_GATEWAY_API_URL=https://api.paymentgateway.com

# Application URL (for payment callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Return URLs (Optional - defaults provided)
NEXT_PUBLIC_PAYMENT_GATEWAY_RETURN_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_PAYMENT_GATEWAY_CANCEL_URL=http://localhost:3000/payment/cancel
NEXT_PUBLIC_PAYMENT_GATEWAY_NOTIFY_URL=https://your-supabase-url.supabase.co/functions/v1/payment-webhook
```

## Configuration Steps

### 1. Get Payment Gateway Credentials

Contact your payment gateway provider to obtain:
- **API Key** - Your authentication key
- **Merchant ID** - Your merchant/business identifier
- **API URL** - The payment gateway API endpoint

Common payment gateways in Sri Lanka:
- PayHere
- iPay
- Genie
- HNB Payment Gateway
- Commercial Bank Payment Gateway

### 2. Update Environment Variables

Add your credentials to the `.env` file:

```bash
NEXT_PUBLIC_PAYMENT_GATEWAY_API_KEY=pk_live_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYMENT_GATEWAY_MERCHANT_ID=merchant_xxxxxx
NEXT_PUBLIC_PAYMENT_GATEWAY_API_URL=https://api.paymentgateway.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Database Migration (if needed)

The orders table should have these fields for payment tracking:
- `payment_method` - Type of payment (card_payment, cash_on_delivery)
- `payment_status` - Status (pending, completed, failed)
- `payment_transaction_id` - Transaction ID from gateway
- `payment_gateway_response` - Full response from gateway (JSONB)

If missing, add them with a migration:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_transaction_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_gateway_response jsonb;
```

### 4. Configure Payment Gateway Webhook

In your payment gateway dashboard, set the webhook/notify URL to:

```
https://xmygsyqiogqbwfotnnxp.supabase.co/functions/v1/payment-webhook
```

This webhook will receive payment status updates and automatically:
- Update order payment status
- Update order status to 'confirmed' on successful payment
- Decrease product stock quantities
- Store transaction details

### 5. Testing

#### Test Mode
Most payment gateways provide test credentials. Use these for development:

```bash
NEXT_PUBLIC_PAYMENT_GATEWAY_API_KEY=pk_test_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYMENT_GATEWAY_MERCHANT_ID=test_merchant_xxxxxx
NEXT_PUBLIC_PAYMENT_GATEWAY_API_URL=https://sandbox.paymentgateway.com
```

#### Test Cards
Payment gateways usually provide test card numbers:
- Visa: 4111 1111 1111 1111
- Mastercard: 5555 5555 5555 4444
- Amex: 3782 822463 10005

### 6. Go Live

When ready for production:
1. Replace test credentials with live credentials
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Update webhook URL in payment gateway dashboard
4. Test with real cards (use small amounts)

## Payment Flow

### Customer Journey

1. **Checkout Page**
   - Customer selects "Card Payment" option
   - Fills in shipping information
   - Clicks "Place Order"

2. **Payment Initiation**
   - Order is created in database with status "pending"
   - Payment gateway initiates transaction
   - Customer is redirected to payment gateway page

3. **Payment Gateway**
   - Customer enters card details on secure gateway page
   - Gateway processes payment
   - Customer is redirected back to your site

4. **Payment Completion**
   - Success: Redirected to `/payment/success`
   - Cancel: Redirected to `/payment/cancel`
   - Webhook notifies system of payment status

5. **Order Confirmation**
   - Webhook updates order status
   - Payment marked as completed
   - Stock quantities decreased
   - Customer can view order in "My Orders"

## Payment Gateway Integration

### Customizing for Your Gateway

The payment gateway service (`lib/payment-gateway.ts`) is designed to be flexible. You may need to adjust it based on your payment gateway's API.

#### Common Adjustments

**1. API Request Format**

Different gateways use different field names. Update the payload in `initiatePayment()`:

```typescript
const payload = {
  // Adjust these field names to match your gateway
  merchant_id: this.config.merchantId,
  order_id: paymentData.orderId,
  amount: paymentData.amount,
  currency: paymentData.currency,
  // ... add or remove fields as needed
};
```

**2. Response Format**

Update the response parsing to match your gateway:

```typescript
const data = await response.json();

return {
  success: true,
  paymentId: data.payment_id,      // May be different field name
  paymentUrl: data.redirect_url,   // Gateway might call this differently
  transactionId: data.txn_id,      // Adjust to your gateway's field
  status: data.status,
};
```

**3. Webhook Format**

Update the webhook handler (`supabase/functions/payment-webhook/index.ts`) to match your gateway's webhook payload:

```typescript
const {
  payment_id,        // Adjust field names
  transaction_id,    // to match your
  order_id,          // gateway's webhook
  status,            // payload structure
  amount,
  signature          // Some gateways send signatures for verification
} = webhookData;
```

## Security Considerations

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables
- Keep test and production keys separate

### 2. Webhook Verification
Some gateways send a signature to verify webhook authenticity. Add verification:

```typescript
// In payment-webhook function
const signature = webhookData.signature;
const calculatedSignature = calculateSignature(webhookData, secretKey);

if (signature !== calculatedSignature) {
  return new Response(
    JSON.stringify({ error: 'Invalid signature' }),
    { status: 401, headers: corsHeaders }
  );
}
```

### 3. HTTPS Only
- Always use HTTPS in production
- Payment gateways require secure connections

### 4. Amount Verification
Always verify the amount received matches the order:

```typescript
const { data: order } = await supabase
  .from('orders')
  .select('total_amount')
  .eq('id', order_id)
  .single();

if (Number(order.total_amount) !== Number(webhookData.amount)) {
  // Log suspicious activity
  console.error('Amount mismatch detected');
}
```

## Troubleshooting

### Payment Gateway Not Configured Warning

If you see "Card payment is not configured" on checkout:
1. Check `.env` file has all required variables
2. Restart the development server
3. Verify API credentials are correct

### Webhook Not Receiving Updates

1. Check webhook URL in gateway dashboard
2. Verify Supabase edge function is deployed: `payment-webhook`
3. Check edge function logs in Supabase dashboard
4. Test webhook with gateway's test panel

### Payment Stuck in Pending

1. Check if webhook was received (check edge function logs)
2. Verify order ID matches in webhook payload
3. Manually update order if needed:

```sql
UPDATE orders
SET payment_status = 'completed',
    status = 'confirmed'
WHERE order_number = 'ORDER_NUMBER';
```

### Gateway Returns Error

1. Check API credentials are correct
2. Verify API URL is correct
3. Check gateway account is active
4. Review gateway's API documentation for error codes

## Support

For payment gateway specific issues:
- Contact your payment gateway provider's support
- Check their API documentation
- Review their integration guides

For application issues:
- Check Supabase edge function logs
- Review browser console for errors
- Check database order records

## Additional Features

### Future Enhancements

Consider adding:
- **Refunds** - Process refunds through gateway
- **Partial Payments** - Allow deposits or installments
- **Payment Plans** - Multiple payment options
- **Multiple Gateways** - Support different payment processors
- **Recurring Payments** - For subscriptions
- **Payment Analytics** - Track conversion rates

### Example: Adding Refund Functionality

```typescript
async refundPayment(transactionId: string, amount: number): Promise<PaymentResponse> {
  const response = await fetch(`${this.config.apiUrl}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    },
    body: JSON.stringify({
      merchant_id: this.config.merchantId,
      transaction_id: transactionId,
      amount: amount,
    }),
  });

  // Handle response...
}
```

## Quick Start Checklist

- [ ] Get API credentials from payment gateway provider
- [ ] Add credentials to `.env` file
- [ ] Configure webhook URL in gateway dashboard
- [ ] Test with test credentials
- [ ] Verify webhook receives updates
- [ ] Test successful payment flow
- [ ] Test cancelled payment flow
- [ ] Switch to production credentials
- [ ] Verify production payment works
- [ ] Monitor transactions

## Files Modified/Created

- `lib/payment-gateway.ts` - Payment gateway service
- `app/checkout/page.tsx` - Updated with card payment option
- `app/payment/success/page.tsx` - Payment success page
- `app/payment/cancel/page.tsx` - Payment cancelled page
- `supabase/functions/payment-webhook/index.ts` - Webhook handler
- `.env` - Environment variables (not committed)

---

**Need Help?** Review your payment gateway's API documentation for specific integration details.
