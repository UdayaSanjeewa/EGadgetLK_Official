/*
  # Add Public Read Access for Products

  1. Changes
    - Add new RLS policy to allow anonymous (public) users to view active products
    - This enables the category pages and home page to display products without requiring authentication
  
  2. Security
    - Anonymous users can only SELECT (read) products with status = 'active'
    - All other operations (INSERT, UPDATE, DELETE) still require authentication
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can read active products" ON products;

-- Create new policy for authenticated users
CREATE POLICY "Authenticated users can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin(auth.uid()));

-- Create new policy for anonymous users
CREATE POLICY "Public can read active products"
  ON products
  FOR SELECT
  TO anon
  USING (status = 'active');
