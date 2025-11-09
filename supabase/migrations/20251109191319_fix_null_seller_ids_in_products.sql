/*
  # Fix Null Seller IDs in Products

  1. Updates
    - Set seller_id to admin user for products with null seller_id
    - This ensures all products have a valid seller

  2. Notes
    - Uses the first admin user found in profiles table
    - Only updates products where seller_id is currently null
*/

-- Update products with null seller_id to use the first admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the first admin user
  SELECT id INTO admin_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- Update products with null seller_id
  IF admin_user_id IS NOT NULL THEN
    UPDATE products 
    SET seller_id = admin_user_id,
        seller_name = 'Admin',
        seller_rating = 5
    WHERE seller_id IS NULL;
  END IF;
END $$;
