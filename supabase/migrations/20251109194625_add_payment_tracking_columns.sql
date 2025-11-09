/*
  # Add Payment Tracking Columns to Orders Table

  1. New Columns
    - `payment_transaction_id` (text) - Store transaction ID from payment gateway
    - `payment_gateway_response` (jsonb) - Store complete response from payment gateway for audit

  2. Purpose
    - Track payment gateway transactions
    - Store gateway response for debugging and reconciliation
    - Support card payment integration
*/

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_transaction_id text,
ADD COLUMN IF NOT EXISTS payment_gateway_response jsonb;
