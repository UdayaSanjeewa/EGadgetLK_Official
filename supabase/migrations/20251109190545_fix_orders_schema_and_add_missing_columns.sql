/*
  # Fix Orders Schema and Add Missing Columns

  1. Changes to `orders` table
    - Add missing columns that checkout expects:
      - `order_number` (text) - Unique order reference
      - `shipping_city` (text) - City for shipping
      - `shipping_postal_code` (text) - Postal code
      - `customer_name` (text) - Customer's full name
      - `customer_email` (text) - Customer's email
      - `customer_mobile` (text) - Customer's phone
      - `payment_method` (text) - Payment method used
      - `notes` (text) - Order notes
    - Change `shipping_address` from jsonb to text

  2. Changes to `order_items` table
    - Add missing columns:
      - `product_title` (text) - Product name
      - `product_image` (text) - Product image URL
      - `subtotal` (numeric) - Line item total
      - `seller_id` (uuid) - Seller reference

  3. Functions
    - Create `generate_order_number()` function to generate unique order numbers

  4. Security
    - Add RLS policy for order_items
*/

-- Add missing columns to orders table
DO $$ 
BEGIN
  -- Add order_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
  END IF;

  -- Add shipping_city
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_city'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_city TEXT;
  END IF;

  -- Add shipping_postal_code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_postal_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_postal_code TEXT;
  END IF;

  -- Add customer_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
  END IF;

  -- Add customer_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
  END IF;

  -- Add customer_mobile
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_mobile'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_mobile TEXT;
  END IF;

  -- Add payment_method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash_on_delivery';
  END IF;

  -- Add notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Fix shipping_address column type (convert jsonb to text if needed)
-- This is safe as we're converting jsonb to text
DO $$
BEGIN
  -- Check if shipping_address is jsonb
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'shipping_address' 
    AND data_type = 'jsonb'
  ) THEN
    -- Alter the column type
    ALTER TABLE orders ALTER COLUMN shipping_address TYPE TEXT USING shipping_address::text;
  END IF;
END $$;

-- Add missing columns to order_items table
DO $$ 
BEGIN
  -- Add product_title
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_title'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_title TEXT;
  END IF;

  -- Add product_image
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_image'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_image TEXT;
  END IF;

  -- Add subtotal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE order_items ADD COLUMN subtotal NUMERIC;
  END IF;

  -- Add seller_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'seller_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN seller_id UUID;
  END IF;
END $$;

-- Create generate_order_number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate order number: ORD + timestamp + random 4 digits
    new_order_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if order number already exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number) INTO order_exists;
    
    -- If it doesn't exist, we can use it
    IF NOT order_exists THEN
      RETURN new_order_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for order_items if they don't exist
DO $$
BEGIN
  -- Enable RLS on order_items
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  
  -- Users can read their own order items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' 
    AND policyname = 'Users can read own order items'
  ) THEN
    CREATE POLICY "Users can read own order items"
      ON order_items
      FOR SELECT
      TO authenticated
      USING (
        order_id IN (
          SELECT id FROM orders WHERE user_id = auth.uid()
        )
      );
  END IF;

  -- Users can insert order items for their own orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' 
    AND policyname = 'Users can insert own order items'
  ) THEN
    CREATE POLICY "Users can insert own order items"
      ON order_items
      FOR INSERT
      TO authenticated
      WITH CHECK (
        order_id IN (
          SELECT id FROM orders WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;
