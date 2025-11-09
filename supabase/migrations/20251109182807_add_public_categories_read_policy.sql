/*
  # Add Public Read Access for Categories

  1. Changes
    - Add new RLS policy to allow anonymous (public) users to view all categories
    - This enables the home page and category pages to display categories without requiring authentication
  
  2. Security
    - Anonymous users can only SELECT (read) categories
    - All other operations (INSERT, UPDATE, DELETE) still require authentication and admin privileges
*/

-- Create new policy for anonymous users to read categories
CREATE POLICY "Public can read categories"
  ON categories
  FOR SELECT
  TO anon
  USING (true);
