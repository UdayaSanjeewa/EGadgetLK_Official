/*
  # Add District Field to Seller Profiles

  ## Overview
  This migration adds a district field to the seller_profiles table to store
  the seller's location (district) in Sri Lanka.

  ## Changes
  1. Add district column to seller_profiles table
  2. Set default district for existing sellers
*/

-- Add district column to seller_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_profiles' AND column_name = 'district'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN district text;
  END IF;
END $$;

-- Set default district for existing sellers who don't have one
UPDATE seller_profiles
SET district = 'Colombo'
WHERE district IS NULL;
