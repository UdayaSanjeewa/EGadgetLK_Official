# Stripe Payment Gateway Setup Guide

Complete guide to integrate Stripe payments into your e-commerce application.

## Overview

Your application is now configured to accept card payments through Stripe. This guide will help you complete the setup.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your Supabase project credentials
3. Access to your `.env` file

## Step 1: Get Stripe API Keys

### 1. Create/Login to Stripe Account

Go to https://dashboard.stripe.com and create an account or log in.

### 2. Get API Keys

1. Navigate to **Developers** → **API keys** in your Stripe Dashboard
2. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 3. Test vs Live Keys

- **Test Mode**: Use `pk_test_...` and `sk_test_...` for development
- **Live Mode**: Use `pk_live_...` and `sk_live_...` for production

⚠️ **IMPORTANT**: Never share your secret key or commit it to version control!

## Step 2: Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Application URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### For Production:

```bash
# Stripe Keys (Live)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key

# Application URL (Production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
```

## Step 3: Configure Stripe Webhook

Webhooks allow Stripe to notify your application about payment events.

### Local Development (using Stripe CLI)

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local function**:
   ```bash
   stripe listen --forward-to https://xmygsyqiogqbwfotnnxp.supabase.co/functions/v1/stripe-webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)

5. **Add to `.env`**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### Production Setup

1. Go to **Developers** → **Webhooks** in Stripe Dashboard

2. Click **Add endpoint**

3. Enter your webhook URL:
   ```
   https://xmygsyqiogqbwfotnnxp.supabase.co/functions/v1/stripe-webhook
   ```

4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`

5. Copy the **Signing secret** (starts with `whsec_...`)

6. Add to your production environment variables in Supabase:
   - Go to Supabase Dashboard → Project Settings → Edge Functions
   - Add secret: `STRIPE_WEBHOOK_SECRET` with your webhook signing secret

## Step 4: Configure Supabase Secrets

Add Stripe secrets to your Supabase project:

### Option 1: Via Supabase Dashboard

1. Go to **Project Settings** → **Edge Functions**
2. Add these secrets:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret
   - `APP_URL`: Your application URL

### Option 2: Via Supabase CLI

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
supabase secrets set APP_URL=https://yourdomain.com
```

## Step 5: Test the Integration

### Test with Stripe Test Cards

Stripe provides test card numbers for testing:

#### Successful Payment:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

#### Other Test Scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 0069 | Declined (expired card) |

Full list: https://stripe.com/docs/testing

### Testing Flow:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Add Products to Cart**

3. **Go to Checkout**

4. **Select "Card Payment"**

5. **Fill in Shipping Details**

6. **Click "Place Order"**

7. **Enter Test Card Details** on Stripe Checkout page

8. **Complete Payment**

9. **Verify Success**:
   - Check you're redirected to success page
   - Check order status in "My Orders"
   - Check Stripe Dashboard for payment

## How It Works

### Payment Flow:

```
1. Customer clicks "Place Order" with Card Payment
   ↓
2. Order created in database (status: pending)
   ↓
3. Stripe Checkout session created
   ↓
4. Customer redirected to Stripe Checkout page
   ↓
5. Customer enters card details on Stripe
   ↓
6. Stripe processes payment
   ↓
7. Customer redirected back to your site
   ↓
8. Stripe webhook notifies your server
   ↓
9. Order status updated (status: confirmed, payment: completed)
   ↓
10. Product stock decreased
   ↓
11. Customer sees success page
```

### Security:

- ✅ **PCI Compliance**: Stripe handles all card data
- ✅ **Webhook Verification**: Signatures verify webhook authenticity
- ✅ **Secure Keys**: Secret keys never exposed to frontend
- ✅ **HTTPS Only**: All communication encrypted

## Features Implemented

### 1. Stripe Checkout

- Hosted checkout page by Stripe
- Supports all major credit/debit cards
- Built-in 3D Secure authentication
- Mobile-optimized interface
- Multiple currencies supported

### 2. Automatic Order Processing

- Order status automatically updated
- Payment status tracked
- Stock quantities decreased on successful payment
- Failed payments handled gracefully

### 3. Webhook Integration

- Real-time payment notifications
- Handles payment success, failure, and expiration
- Idempotent (safe to retry)
- Verifies webhook signatures

### 4. Customer Experience

- Seamless checkout flow
- Clear payment status
- Email receipts from Stripe
- Order confirmation page

## Currency Configuration

The application is configured for LKR (Sri Lankan Rupees).

### To Change Currency:

1. Update checkout page (`app/checkout/page.tsx`):
   ```typescript
   currency: 'USD', // Change from 'LKR' to your currency
   ```

2. Stripe supports 135+ currencies:
   - USD, EUR, GBP, JPY, AUD, CAD, etc.
   - Full list: https://stripe.com/docs/currencies

## Troubleshooting

### Problem: "Stripe is not configured" message

**Solution**:
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is in `.env`
- Restart development server: `npm run dev`

### Problem: Webhook not receiving events

**Solution**:
- Check webhook URL is correct
- Verify `STRIPE_WEBHOOK_SECRET` is configured
- Check Supabase edge function logs
- For local dev, ensure Stripe CLI is running

### Problem: Payment succeeds but order not updated

**Solution**:
- Check webhook is configured correctly
- Verify Supabase secrets are set
- Check edge function logs for errors
- Test webhook endpoint manually

### Problem: Redirect fails after payment

**Solution**:
- Verify `APP_URL` environment variable
- Check success/cancel URLs in checkout session
- Ensure URLs are accessible

### Problem: "Invalid API Key" error

**Solution**:
- Verify you're using correct key (test vs live)
- Check for typos in environment variables
- Regenerate keys if compromised

## Monitoring & Debugging

### Stripe Dashboard

Monitor payments in real-time:
- **Dashboard** → **Payments**: View all transactions
- **Logs**: See API requests and webhook events
- **Events**: Track webhook deliveries

### Supabase Logs

Check edge function logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Select function and view logs

### Database Queries

Check order status:
```sql
SELECT
  order_number,
  status,
  payment_status,
  payment_transaction_id,
  total_amount
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

## Going Live

### Checklist:

- [ ] Get live Stripe API keys
- [ ] Update environment variables with live keys
- [ ] Configure production webhook endpoint
- [ ] Test with real cards (small amounts)
- [ ] Enable Stripe Radar (fraud prevention)
- [ ] Set up email notifications
- [ ] Review Stripe pricing
- [ ] Update terms of service
- [ ] Configure tax settings (if applicable)

### Stripe Account Requirements:

1. **Business Information**: Complete profile
2. **Bank Account**: Add for payouts
3. **Identity Verification**: Required for live mode
4. **Compliance**: Tax forms (if applicable)

## Pricing

Stripe charges per successful transaction:

### International Cards:
- **2.9% + $0.30** per transaction (US)
- **2.9% + LKR 25** per transaction (Sri Lanka)
- Varies by country

### Additional Features:
- Radar (fraud prevention): +$0.05 per transaction
- Advanced features available

Check current pricing: https://stripe.com/pricing

## Support Resources

### Stripe Documentation:
- API Reference: https://stripe.com/docs/api
- Testing: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks

### Support:
- Stripe Support: https://support.stripe.com
- Stripe Community: https://github.com/stripe

### This Application:
- Edge Functions: `/supabase/functions/`
- Payment Service: `/lib/stripe-payment.ts`
- Checkout Page: `/app/checkout/page.tsx`

## Advanced Configuration

### Custom Checkout Styling

Stripe Checkout appearance can be customized. Update edge function:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... existing config
  theme: 'night', // or 'stripe'
  locale: 'auto', // or specific: 'en', 'ja', etc.
});
```

### Add Shipping Calculation

```typescript
const session = await stripe.checkout.sessions.create({
  // ... existing config
  shipping_options: [
    {
      shipping_rate_data: {
        display_name: 'Express Shipping',
        fixed_amount: { amount: 1500, currency: 'lkr' },
        type: 'fixed_amount',
      },
    },
  ],
});
```

### Save Cards for Future Use

Enable customer portal:
```typescript
const session = await stripe.checkout.sessions.create({
  // ... existing config
  payment_intent_data: {
    setup_future_usage: 'on_session',
  },
});
```

## Security Best Practices

1. ✅ **Never log secret keys**
2. ✅ **Use webhook signatures**
3. ✅ **Validate amounts server-side**
4. ✅ **Use HTTPS in production**
5. ✅ **Keep Stripe.js up to date**
6. ✅ **Monitor for suspicious activity**
7. ✅ **Set up two-factor authentication**
8. ✅ **Regular security audits**

## FAQ

**Q: Do I need PCI compliance?**
A: No, Stripe handles PCI compliance. You never touch card data.

**Q: Can customers save cards?**
A: Yes, implement Stripe Customer Portal for saved cards.

**Q: What about refunds?**
A: Refunds can be processed through Stripe Dashboard or API.

**Q: Does it work on mobile?**
A: Yes, Stripe Checkout is mobile-optimized.

**Q: Can I customize the checkout page?**
A: Stripe Checkout has limited customization. For full control, use Stripe Elements.

**Q: What about recurring payments?**
A: Use Stripe Subscriptions (requires additional setup).

---

**Need Help?** Check Stripe documentation or contact support.

**Ready to go live?** Follow the checklist above!
