/*
  # Fix admin role checks in RLS policies

  1. Changes
    - Update all admin role checks to use user_metadata instead of raw_app_meta_data
    - Affects orders and order_items tables
    - This fixes the checkout order placement failure
  
  2. Security
    - Maintains same security level
    - Corrects the JWT path to check for admin role
*/

-- Fix orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Fix order_items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

CREATE POLICY "Users can view own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
      )
    )
  );
