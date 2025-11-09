/*
  # Add Admin Policy to View All User Profiles

  1. Changes
    - Add SELECT policy for admins to view all user profiles
    - This allows admin dashboard to display accurate user count

  2. Security
    - Policy only allows users with admin role in user_metadata
    - Uses is_admin() helper function for consistency
*/

-- Add policy for admins to view all user profiles
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
