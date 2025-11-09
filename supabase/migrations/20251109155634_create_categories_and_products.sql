/*
  # Create Categories and Products Tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)

    - `products`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references profiles)
      - `category_id` (uuid, references categories)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `stock_quantity` (integer)
      - `image_url` (text)
      - `status` (text) - 'active', 'inactive', 'out_of_stock'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read active products and categories
    - Sellers can manage their own products
    - Admins can manage all products and categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Policies for products
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active' OR seller_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Sellers can insert their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin(auth.uid()))
  WITH CHECK (auth.uid() = seller_id OR is_admin(auth.uid()));

CREATE POLICY "Sellers can delete their own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin(auth.uid()));
