/*
  # Admin and Product Management System

  ## Overview
  This migration creates a complete admin and product management system with separate sections for each category.

  ## 1. New Tables
  
  ### `categories`
  - `id` (uuid, primary key)
  - `name` (text) - Category name
  - `slug` (text, unique) - URL-friendly slug
  - `image` (text) - Category image URL
  - `description` (text) - Optional category description
  - `product_count` (integer) - Count of products in category
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `products`
  - `id` (uuid, primary key)
  - `title` (text) - Product title
  - `description` (text) - Product description
  - `price` (numeric) - Product price
  - `original_price` (numeric) - Original price for discounts
  - `images` (text[]) - Array of image URLs
  - `category_id` (uuid) - Foreign key to categories
  - `condition` (text) - new/used/refurbished
  - `location` (text) - Product location
  - `seller_id` (uuid) - Foreign key to auth.users
  - `seller_name` (text) - Seller display name
  - `seller_avatar` (text) - Seller avatar URL
  - `seller_rating` (numeric) - Seller rating
  - `features` (text[]) - Array of features
  - `tags` (text[]) - Array of tags
  - `is_new` (boolean) - New arrival flag
  - `is_featured` (boolean) - Featured product flag
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Admin users can perform all operations
  - Regular users can view published products
  - Only admins can create/edit/delete products and categories

  ## 3. Important Notes
  - Admin role is determined by checking user metadata
  - Products are linked to categories for organized display
  - Automatic timestamp updates using triggers
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image text NOT NULL,
  description text,
  product_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  original_price numeric CHECK (original_price >= 0),
  images text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  condition text NOT NULL CHECK (condition IN ('new', 'used', 'refurbished')),
  location text NOT NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name text NOT NULL,
  seller_avatar text,
  seller_rating numeric DEFAULT 0 CHECK (seller_rating >= 0 AND seller_rating <= 5),
  features text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_new boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  )
  WITH CHECK (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

CREATE POLICY "Only admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  )
  WITH CHECK (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'role' = 'admin') OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update category product count
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for category product count
DROP TRIGGER IF EXISTS update_category_count ON products;
CREATE TRIGGER update_category_count
  AFTER INSERT OR DELETE OR UPDATE OF category_id ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_category_product_count();