# Database Clear Scripts

This directory contains scripts to clear data from your database.

## Available Scripts

### 1. `clear-database.sql`

A standalone SQL script that clears all orders and products data from the database.

#### What it clears:
- ✅ All order items
- ✅ All orders
- ✅ All products
- ✅ All reviews
- ✅ All watchlist entries
- ✅ Resets category product counts
- ✅ Resets seller product and sales counts

#### What it preserves:
- ✅ User accounts
- ✅ Seller profiles
- ✅ Categories
- ✅ User profiles
- ✅ User addresses
- ✅ Payment methods
- ✅ Notifications

## How to Use

### Option 1: Using Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `clear-database.sql`
4. Click "Run" to execute the script

### Option 2: Using the Migration File

The migration file `supabase/migrations/20251019000001_clear_orders_and_products_data.sql` can be applied when you want to clear data as part of your deployment process.

**Note:** Be careful with this approach as migrations typically run automatically and only once. You may want to comment it out after first use.

### Option 3: Using Supabase CLI (if available)

```bash
# Execute the clear script directly
supabase db execute -f scripts/clear-database.sql
```

## ⚠️ Warning

**This operation is irreversible!**

- All orders and products will be permanently deleted
- There is no undo functionality
- Always backup your data before running this script in production

## When to Use

- 🧪 Clearing test data during development
- 🔄 Resetting the database for fresh start
- 🚀 Preparing for production data migration
- 🧹 Regular cleanup of old/invalid data

## Support

If you encounter any issues with these scripts, check:
1. Database connection is active
2. You have proper permissions to delete data
3. All tables exist (migrations have been applied)
