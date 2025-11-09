# Fix RLS Infinite Recursion Issue

## Problem
The admin orders page is showing an "infinite recursion detected in policy for relation 'orders'" error. This happens because the RLS policies create a circular dependency when checking admin permissions.

## Solution
Apply the SQL migration that uses SECURITY DEFINER functions to break the recursion cycle.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/fwnwrrlvsulybfjjiuhm

2. Navigate to **SQL Editor** (left sidebar)

3. Click **New Query**

4. Copy and paste the entire contents of the file:
   `/supabase/migrations/20251019130000_fix_infinite_recursion_final.sql`

5. Click **Run** (or press Cmd/Ctrl + Enter)

6. You should see a success message

7. Refresh your admin orders page - the orders should now load without errors!

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## What This Migration Does

1. **Drops all existing problematic policies** for orders and order_items tables

2. **Creates helper functions**:
   - `is_admin()` - Checks if a user has admin role (bypasses RLS)
   - `user_owns_order_secure()` - Checks if a user owns an order (bypasses RLS)

3. **Creates new policies** that use these helper functions to avoid recursion:
   - Orders policies: Allow users to see their own orders, admins to see all
   - Order items policies: Allow users to see their order items, admins to see all, sellers to see their items

## Testing

After applying the migration:

1. Go to `/admin/login` and log in as admin (admin1@mission.com / Admin@123)
2. Navigate to `/admin/orders`
3. You should see all orders listed with seller information
4. Click on the "Seller Income" tab to see income breakdown by seller
5. No errors should appear in the browser console

## Rollback

If you need to rollback, you can restore the previous policies by running the earlier migrations. However, this will bring back the recursion issue.
