/*
  # Clear Orders and Products Data

  ## Overview
  This migration clears all data from orders and products related tables.
  Use this when you want to reset your database and start fresh.

  ## What This Script Does

  1. **Clears Order Data**
     - Deletes all records from `order_items` (must be done first due to foreign key)
     - Deletes all records from `orders`

  2. **Clears Product Data**
     - Deletes all records from `products`
     - Resets category product counts to 0

  3. **Clears Related Data**
     - Clears watchlist entries
     - Clears product reviews

  ## Important Notes
  - This is a DATA DELETION operation - all orders and products will be permanently removed
  - This does NOT delete:
    - User accounts
    - Seller profiles
    - Categories
    - User profiles, addresses, payment methods, or notifications
  - Category counts will be reset to 0
  - This operation cannot be undone

  ## When to Use
  - When you want to clear test data
  - When starting fresh with a clean database
  - When migrating from test to production data
*/

-- Disable triggers temporarily to avoid count updates during deletion
ALTER TABLE products DISABLE TRIGGER update_category_count;
ALTER TABLE products DISABLE TRIGGER update_seller_product_count;

-- Clear order items first (foreign key dependency)
DELETE FROM order_items;

-- Clear orders
DELETE FROM orders;

-- Clear product-related data
DELETE FROM reviews;
DELETE FROM watchlist;
DELETE FROM products;

-- Reset category product counts to 0
UPDATE categories SET product_count = 0;

-- Reset seller product counts to 0
UPDATE seller_profiles SET total_products = 0, total_sales = 0;

-- Re-enable triggers
ALTER TABLE products ENABLE TRIGGER update_category_count;
ALTER TABLE products ENABLE TRIGGER update_seller_product_count;

-- Log completion message
DO $$
BEGIN
  RAISE NOTICE 'Successfully cleared all orders and products data';
  RAISE NOTICE 'Orders deleted, Products deleted, Reviews deleted, Watchlist cleared';
  RAISE NOTICE 'Category and seller counts have been reset to 0';
END $$;
