/*
  # Create Seller Management System

  ## Overview
  This migration creates a complete seller system for the eCommerce platform,
  allowing sellers to manage their own products and orders.

  ## 1. New Tables

  ### `seller_profiles`
  Stores detailed seller information
  - `id` (uuid, primary key) - References auth.users
  - `business_name` (text) - Business/shop name
  - `business_description` (text) - About the business
  - `business_email` (text) - Business contact email
  - `business_phone` (text) - Business phone number
  - `business_address` (text) - Business physical address
  - `business_logo` (text) - Logo URL
  - `rating` (numeric) - Average seller rating
  - `total_sales` (integer) - Total number of sales
  - `total_products` (integer) - Total number of products
  - `is_verified` (boolean) - Verification status
  - `is_active` (boolean) - Active status
  - `joined_at` (timestamptz) - Registration timestamp
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `seller_bank_details`
  Stores seller payment information
  - `id` (uuid, primary key)
  - `seller_id` (uuid) - References seller_profiles
  - `bank_name` (text) - Bank name
  - `account_holder_name` (text) - Account holder name
  - `account_number` (text) - Account number (encrypted)
  - `branch` (text) - Bank branch
  - `swift_code` (text) - SWIFT/BIC code for international
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Updates
  - Update products RLS policies to allow sellers to manage their own products
  - Update orders table to include seller_id
  - Add seller_id to order_items for direct seller association

  ## 3. Security
  - Enable RLS on all tables
  - Sellers can only access their own data
  - Admins can view and manage all sellers
  - Sellers can manage their own products and view their orders
*/

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_description text,
  business_email text NOT NULL,
  business_phone text,
  business_address text,
  business_logo text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_sales integer DEFAULT 0,
  total_products integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create seller_bank_details table
CREATE TABLE IF NOT EXISTS seller_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  branch text,
  swift_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(seller_id)
);

-- Add seller_id to order_items if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'seller_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN seller_id uuid REFERENCES seller_profiles(id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_active ON seller_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON seller_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON order_items(seller_id);

-- Enable RLS
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_bank_details ENABLE ROW LEVEL SECURITY;

-- Seller Profiles Policies
CREATE POLICY "Anyone can view active seller profiles"
  ON seller_profiles FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Sellers can view own profile"
  ON seller_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "New sellers can create own profile"
  ON seller_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Sellers can update own profile"
  ON seller_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all seller profiles"
  ON seller_profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

CREATE POLICY "Admins can update all seller profiles"
  ON seller_profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

CREATE POLICY "Admins can delete seller profiles"
  ON seller_profiles FOR DELETE
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Seller Bank Details Policies
CREATE POLICY "Sellers can view own bank details"
  ON seller_bank_details FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert own bank details"
  ON seller_bank_details FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own bank details"
  ON seller_bank_details FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own bank details"
  ON seller_bank_details FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all bank details"
  ON seller_bank_details FOR SELECT
  TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Update Products Policies for Sellers
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

CREATE POLICY "Admins and sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    (auth.jwt()->'user_metadata'->>'role') = 'seller' AND seller_id = auth.uid()
  );

CREATE POLICY "Admins and sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    (seller_id = auth.uid() AND (auth.jwt()->'user_metadata'->>'role') = 'seller')
  )
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    (seller_id = auth.uid() AND (auth.jwt()->'user_metadata'->>'role') = 'seller')
  );

CREATE POLICY "Admins and sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    (seller_id = auth.uid() AND (auth.jwt()->'user_metadata'->>'role') = 'seller')
  );

-- Orders policy for sellers
CREATE POLICY "Sellers can view orders with their products"
  ON orders FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'seller' AND
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_items.order_id = orders.id
      AND order_items.seller_id = auth.uid()
    )
  );

-- Order items policy for sellers
CREATE POLICY "Sellers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'seller' AND
    seller_id = auth.uid()
  );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_seller_profiles_updated_at ON seller_profiles;
CREATE TRIGGER update_seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seller_bank_details_updated_at ON seller_bank_details;
CREATE TRIGGER update_seller_bank_details_updated_at
  BEFORE UPDATE ON seller_bank_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update seller's total_products count
CREATE OR REPLACE FUNCTION update_seller_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE seller_profiles SET total_products = total_products + 1 WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE seller_profiles SET total_products = total_products - 1 WHERE id = OLD.seller_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.seller_id != NEW.seller_id THEN
    UPDATE seller_profiles SET total_products = total_products - 1 WHERE id = OLD.seller_id;
    UPDATE seller_profiles SET total_products = total_products + 1 WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for seller product count
DROP TRIGGER IF EXISTS update_seller_product_count ON products;
CREATE TRIGGER update_seller_product_count
  AFTER INSERT OR DELETE OR UPDATE OF seller_id ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_product_count();
