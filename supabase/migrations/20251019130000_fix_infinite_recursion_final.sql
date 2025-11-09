/*
  # Fix Infinite Recursion in RLS Policies - Final Fix

  ## Problem
  The RLS policies are causing infinite recursion because:
  1. Admin tries to read order_items
  2. order_items policy checks orders table to verify admin
  3. orders policy checks if user is admin
  4. This creates a circular dependency

  ## Solution
  Use SECURITY DEFINER functions that bypass RLS to check ownership and admin status.
  This breaks the recursion cycle.

  ## Changes
  1. Create helper functions with SECURITY DEFINER
  2. Recreate all policies to use these helper functions
  3. Ensure admin can access all data without recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can insert order items" ON order_items;
DROP POLICY IF EXISTS "Sellers can view their order items" ON order_items;

-- Drop existing helper function
DROP FUNCTION IF EXISTS user_owns_order(uuid, uuid);

-- Create helper function to check if user is admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.jwt()->'user_metadata'->>'role') = 'admin';
$$;

-- Create helper function to check order ownership (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION user_owns_order_secure(p_order_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = p_order_id AND user_id = p_user_id
  );
$$;

-- ORDERS POLICIES
CREATE POLICY "Users and admins can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR is_admin(auth.uid())
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ORDER ITEMS POLICIES
CREATE POLICY "Users and admins can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    user_owns_order_secure(order_id, auth.uid()) OR is_admin(auth.uid())
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    user_owns_order_secure(order_id, auth.uid())
  );

CREATE POLICY "Admins can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Sellers can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    seller_id = auth.uid()
  );
