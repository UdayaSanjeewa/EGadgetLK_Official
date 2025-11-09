/*
  # Update Seller Order Management to Include 'Ready' Status

  ## Overview
  This migration updates the seller order management system to allow sellers
  to mark orders as 'ready' before shipping.

  ## Changes
  1. Update the RLS policy to allow sellers to set 'ready' status
  2. The workflow now becomes: pending → confirmed → ready → shipped → delivered
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Sellers can update orders with their products" ON orders;

-- Create updated policy that allows 'ready' status
CREATE POLICY "Sellers can update orders with their products"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'seller' AND
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_items.order_id = orders.id
      AND order_items.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'seller' AND
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_items.order_id = orders.id
      AND order_items.seller_id = auth.uid()
    ) AND
    status IN ('confirmed', 'ready', 'shipped', 'delivered')
  );
