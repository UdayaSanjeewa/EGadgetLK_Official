/*
  # Update Products Table Structure

  1. Changes
    - Add missing columns for full e-commerce functionality
    - Rename 'name' to 'title' for consistency with frontend
    - Add support for multiple images (JSON array)
    - Add seller information fields
    - Add product metadata (condition, location, tags, features)
    - Add product status flags (is_featured, is_new)

  2. Data Migration
    - Safely migrate existing data to new structure
*/

-- Add new columns to products table
DO $$ 
BEGIN
  -- Add title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'title'
  ) THEN
    ALTER TABLE products ADD COLUMN title text;
    -- Copy data from name to title
    UPDATE products SET title = name WHERE title IS NULL;
    -- Make title not null after data migration
    ALTER TABLE products ALTER COLUMN title SET NOT NULL;
  END IF;

  -- Add original_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE products ADD COLUMN original_price numeric CHECK (original_price >= 0);
  END IF;

  -- Add images column (JSON array) if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add condition column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'condition'
  ) THEN
    ALTER TABLE products ADD COLUMN condition text DEFAULT 'new' 
      CHECK (condition IN ('new', 'used', 'refurbished'));
  END IF;

  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'location'
  ) THEN
    ALTER TABLE products ADD COLUMN location text DEFAULT '';
  END IF;

  -- Add seller_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_id'
  ) THEN
    ALTER TABLE products ADD COLUMN seller_id uuid;
  END IF;

  -- Add seller_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_name'
  ) THEN
    ALTER TABLE products ADD COLUMN seller_name text DEFAULT 'Admin';
  END IF;

  -- Add seller_avatar column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_avatar'
  ) THEN
    ALTER TABLE products ADD COLUMN seller_avatar text DEFAULT '';
  END IF;

  -- Add seller_rating column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_rating'
  ) THEN
    ALTER TABLE products ADD COLUMN seller_rating numeric DEFAULT 5 
      CHECK (seller_rating >= 0 AND seller_rating <= 5);
  END IF;

  -- Add features column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'features'
  ) THEN
    ALTER TABLE products ADD COLUMN features jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'tags'
  ) THEN
    ALTER TABLE products ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  -- Add is_new column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_new'
  ) THEN
    ALTER TABLE products ADD COLUMN is_new boolean DEFAULT false;
  END IF;
END $$;
