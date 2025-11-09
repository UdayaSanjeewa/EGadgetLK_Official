/*
  # Fix Orders RLS Infinite Recursion

  ## Problem
  The order_items SELECT policy was causing infinite recursion by querying
  the orders table in its USING clause, which in turn triggered the orders
  SELECT policy that checks admin status.

  ## Solution
  1. Drop and recreate the problematic policies
  2. Simplify order_items policies to avoid querying orders table
  3. Add a helper function to check order ownership without triggering recursion

  ## Changes
  - Drop existing order_items policies
  - Create new simplified policies that don't cause recursion
  - Add proper admin policies for order_items
*/

-- Drop existing order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

-- Create helper function to check if user owns an order (uses SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION user_owns_order(order_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_id AND orders.user_id = user_id
  );
$$;

-- Create new order_items policies without recursion
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    user_owns_order(order_id, auth.uid()) 
    OR (auth.jwt()->>'raw_app_meta_data')::jsonb->>'role' = 'admin'
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    user_owns_order(order_id, auth.uid())
  );

CREATE POLICY "Admins can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'raw_app_meta_data')::jsonb->>'role' = 'admin'
  );
