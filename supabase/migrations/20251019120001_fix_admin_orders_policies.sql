/*
  # Fix Admin Orders Policies

  ## Overview
  This migration fixes the RLS policies for the orders and order_items tables to allow
  admins to read all orders. The issue was using 'raw_app_meta_data' instead of 'user_metadata'.

  ## Changes
  1. Drop and recreate the admin SELECT policy for orders
  2. Drop and recreate the admin SELECT policy for order_items
  3. Use correct JWT path: user_metadata->>'role' instead of raw_app_meta_data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Recreate orders SELECT policy with correct admin check
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Recreate order_items SELECT policy with correct admin check
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid() OR
        (auth.jwt()->'user_metadata'->>'role') = 'admin'
      )
    )
  );

-- Recreate admin UPDATE policy with correct path
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Add policy for sellers to view their order items
CREATE POLICY "Sellers can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    seller_id = auth.uid() OR
    ((auth.jwt()->'user_metadata'->>'role') = 'seller' AND seller_id = auth.uid())
  );
