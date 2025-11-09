/*
  CLEAR DATABASE SCRIPT

  This script clears all orders and products data from the database.
  Run this script whenever you need to reset your database.

  WARNING: This will permanently delete:
  - All orders and order items
  - All products
  - All reviews
  - All watchlist entries

  This will NOT delete:
  - User accounts
  - Seller profiles
  - Categories
  - User profiles, addresses, payment methods, notifications
*/

-- Disable triggers temporarily
ALTER TABLE products DISABLE TRIGGER update_category_count;
ALTER TABLE products DISABLE TRIGGER update_seller_product_count;

-- Clear order items first (foreign key dependency)
TRUNCATE TABLE order_items CASCADE;

-- Clear orders
TRUNCATE TABLE orders CASCADE;

-- Clear product-related data
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE watchlist CASCADE;
TRUNCATE TABLE products CASCADE;

-- Reset category product counts to 0
UPDATE categories SET product_count = 0;

-- Reset seller product counts to 0
UPDATE seller_profiles SET total_products = 0, total_sales = 0;

-- Re-enable triggers
ALTER TABLE products ENABLE TRIGGER update_category_count;
ALTER TABLE products ENABLE TRIGGER update_seller_product_count;

-- Success message
SELECT 'Database cleared successfully!' as status;
