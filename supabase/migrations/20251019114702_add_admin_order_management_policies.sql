/*
  # Add Admin Order Management Policies

  ## Overview
  This migration adds RLS policies to allow admins to manage orders after sellers
  have confirmed them, including updating order status for logistics management.

  ## Changes
  1. Add admin policy for updating order status after confirmation
  2. Allow admin to transition orders through: confirmed → ready → shipped → delivered
*/

-- Add admin policy for order updates
CREATE POLICY "Admins can update order status after confirmation"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin' AND
    status IN ('confirmed', 'ready', 'shipped', 'delivered')
  )
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'admin' AND
    status IN ('confirmed', 'ready', 'shipped', 'delivered', 'cancelled')
  );
