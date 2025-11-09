/*
  # Fix User Creation Trigger

  1. Changes
    - Update handle_new_user function to use SECURITY DEFINER
    - This allows the trigger to bypass RLS policies when creating profiles
    - Ensures users can be created successfully through auth.admin API
*/

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
