/*
  # Remove Seller Role and Transfer Functions to Admin

  1. Changes
    - Update profiles table to remove 'seller' from role enum
    - Remove seller_id from products table (admin manages all products)
    - Remove seller_id from order_items table
    - Drop seller_details table (no longer needed)
    - Update all RLS policies to reflect admin-only product management
    - Migrate existing seller data to admin role

  2. New Structure
    - Only 'customer' and 'admin' roles exist
    - Admin manages all products, categories, and orders
    - Customers can browse and purchase
*/

-- First, update any existing sellers to admin role
UPDATE profiles SET role = 'admin' WHERE role = 'seller';

-- Drop old seller_details table
DROP TABLE IF EXISTS seller_details CASCADE;

-- Drop old products table and recreate without seller_id
DROP TABLE IF EXISTS products CASCADE;

-- Recreate products table without seller_id
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- New policies for products (admin-only management)
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Drop old order_items table and recreate without seller_id
DROP TABLE IF EXISTS order_items CASCADE;

-- Recreate order_items table without seller_id
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'shipped', 'delivered')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- New policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update profiles table role check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('customer', 'admin'));

-- Update default role in handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
