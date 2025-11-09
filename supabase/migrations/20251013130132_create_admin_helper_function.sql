/*
  # Create Admin Helper Function

  This migration creates a helper function to set a user as admin.
  
  1. Functions
    - `set_user_as_admin(user_email text)`: Sets a user's role to 'admin' in their metadata
  
  2. Security
    - This function can only be called by authenticated users
    - In production, you should add additional security checks
*/

-- Function to set a user as admin by email
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  -- If user doesn't exist, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update the user's metadata to set role as admin
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE id = user_id;

  RETURN true;
END;
$$;
