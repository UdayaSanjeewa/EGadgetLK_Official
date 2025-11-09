/*
  # Add admin policy to view all user profiles

  1. Changes
    - Add SELECT policy for users with admin role to view all profiles
    - This allows admin dashboard to correctly count and display all users
  
  2. Security
    - Policy checks user metadata for admin role
    - Only affects SELECT operations
    - Existing user policies remain unchanged
*/

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );
