/*
  # Create Orders and User Profiles Tables

  ## Overview
  This migration creates tables for managing customer orders and enhanced user profiles
  for the eCommerce platform.

  ## New Tables

  ### 1. `user_profiles`
  Stores extended user information beyond authentication
  - `id` (uuid, primary key) - References auth.users
  - `name` (text) - User's full name
  - `email` (text) - User's email address
  - `mobile` (text) - User's mobile number
  - `address` (text) - Shipping/billing address
  - `city` (text) - City
  - `postal_code` (text) - Postal code
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `orders`
  Stores customer order information
  - `id` (uuid, primary key) - Unique order identifier
  - `user_id` (uuid) - References auth.users
  - `order_number` (text, unique) - Human-readable order number
  - `status` (text) - Order status (pending, confirmed, shipped, delivered, cancelled)
  - `total_amount` (numeric) - Total order amount
  - `shipping_address` (text) - Delivery address
  - `shipping_city` (text) - Delivery city
  - `shipping_postal_code` (text) - Delivery postal code
  - `customer_name` (text) - Customer name at time of order
  - `customer_email` (text) - Customer email at time of order
  - `customer_mobile` (text) - Customer mobile at time of order
  - `payment_method` (text) - Payment method used
  - `payment_status` (text) - Payment status (pending, paid, failed, refunded)
  - `notes` (text) - Order notes or special instructions
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `order_items`
  Stores individual items within each order
  - `id` (uuid, primary key) - Unique item identifier
  - `order_id` (uuid) - References orders table
  - `product_id` (uuid) - References products table
  - `product_title` (text) - Product title at time of order
  - `product_image` (text) - Product image URL
  - `quantity` (integer) - Quantity ordered
  - `price` (numeric) - Price per unit at time of order
  - `subtotal` (numeric) - Total price for this line item
  - `created_at` (timestamptz) - Item creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own profiles and orders
  - Admins can view all orders
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  mobile text,
  address text,
  city text,
  postal_code text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric(10, 2) NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_postal_code text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_mobile text NOT NULL,
  payment_method text NOT NULL DEFAULT 'cash_on_delivery',
  payment_status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_title text NOT NULL,
  product_image text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10, 2) NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Orders Policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt()->>'raw_app_meta_data')::jsonb->>'role' = 'admin');

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
  USING ((auth.jwt()->>'raw_app_meta_data')::jsonb->>'role' = 'admin')
  WITH CHECK ((auth.jwt()->>'raw_app_meta_data')::jsonb->>'role' = 'admin');

-- Order Items Policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR (auth.jwt()->>'raw_app_meta_data')::jsonb->>'role' = 'admin')
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_number text;
  max_order_number text;
  order_count integer;
  today_prefix text;
BEGIN
  today_prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD');

  -- Get the highest order number for today
  SELECT order_number INTO max_order_number
  FROM orders
  WHERE order_number LIKE today_prefix || '%'
  ORDER BY order_number DESC
  LIMIT 1;

  -- If we have orders today, extract the counter and increment
  IF max_order_number IS NOT NULL THEN
    order_count := SUBSTRING(max_order_number FROM '[0-9]+$')::integer + 1;
  ELSE
    order_count := 1;
  END IF;

  -- Generate the new order number
  new_order_number := today_prefix || '-' || LPAD(order_count::text, 5, '0');

  -- Check if it already exists (safety check)
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) LOOP
    order_count := order_count + 1;
    new_order_number := today_prefix || '-' || LPAD(order_count::text, 5, '0');
  END LOOP;

  RETURN new_order_number;
END;
$$;