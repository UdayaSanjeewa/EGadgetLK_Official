/*
  Create Test Accounts

  This script creates 9 test accounts:
  - 3 Regular Users
  - 3 Admin Users
  - 3 Seller Users

  IMPORTANT: This script needs to be run in the Supabase Dashboard SQL Editor
  because it requires admin privileges to create auth users.

  You cannot create auth.users directly via SQL - you need to use the Supabase Auth Admin API.

  INSTRUCTIONS:
  1. Go to your Supabase Dashboard
  2. Navigate to SQL Editor
  3. Create a new query
  4. Paste this script
  5. Run it

  OR use the edge function by visiting: /create-accounts.html in your browser
*/

-- NOTE: You cannot insert directly into auth.users table via SQL
-- This script is just for reference of what accounts should be created

-- The accounts that should be created:

-- Regular Users:
-- Email: user1@sibn.com, Password: user123, Name: John Smith
-- Email: user2@sibn.com, Password: user123, Name: Sarah Johnson
-- Email: user3@sibn.com, Password: user123, Name: Mike Davis

-- Admin Users:
-- Email: admin1@sibn.com, Password: admin123, Name: Admin One
-- Email: admin2@sibn.com, Password: admin123, Name: Admin Two
-- Email: admin3@sibn.com, Password: admin123, Name: Admin Three

-- Seller Users:
-- Email: seller1@sibn.com, Password: seller123, Name: Tech Store
-- Email: seller2@sibn.com, Password: seller123, Name: Fashion Hub
-- Email: seller3@sibn.com, Password: seller123, Name: Home Goods

SELECT 'Please use the Supabase Auth Admin API or visit /create-accounts.html to create these accounts' as message;
