/*
  # Add Seller Order Management System

  ## Overview
  This migration adds comprehensive order management capabilities for sellers,
  including status updates and order history tracking.

  ## 1. New Tables

  ### `order_status_history`
  Tracks all status changes for orders
  - `id` (uuid, primary key) - Unique identifier
  - `order_id` (uuid) - References orders table
  - `old_status` (text) - Previous status
  - `new_status` (text) - New status
  - `changed_by` (uuid) - User who made the change
  - `changed_by_role` (text) - Role of user (admin, seller, customer)
  - `notes` (text) - Optional notes about the change
  - `created_at` (timestamptz) - When the change was made

  ## 2. Policy Updates
  - Allow sellers to update order status for orders containing their products
  - Sellers can only transition to specific statuses (confirmed, shipped, delivered)
  - Prevent sellers from cancelling orders (only admins and customers can)

  ## 3. Security
  - Enable RLS on order_status_history table
  - Sellers can view history for their orders
  - Admins can view all history
  - Automatic tracking of status changes via trigger
*/

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_by_role text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Order Status History Policies
CREATE POLICY "Users can view history of their orders"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can view history of orders with their products"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'seller' AND
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_items.order_id = order_status_history.order_id
      AND order_items.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

CREATE POLICY "System can insert history"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add seller order update policy
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
    status IN ('confirmed', 'shipped', 'delivered')
  );

-- Function to automatically track order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    user_role := COALESCE(
      (auth.jwt()->'user_metadata'->>'role')::text,
      'system'
    );
    
    INSERT INTO order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by,
      changed_by_role
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      user_role
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS track_order_status_change_trigger ON orders;
CREATE TRIGGER track_order_status_change_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();
