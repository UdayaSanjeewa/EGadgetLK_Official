#!/bin/bash

URL="https://fwnwrrlvsulybfjjiuhm.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bndycmx2c3VseWJmamppdWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjA5NTYsImV4cCI6MjA3NjQzNjk1Nn0.jl1gDB1ksdDBAPkWFeEqGnoYS7kb05QXCHfIq5csCec"

# Execute each SQL statement
echo "Dropping existing policies..."

curl -X POST "$URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"DROP POLICY IF EXISTS \"Users can view own orders\" ON orders"}'

echo "Creating helper functions..."
curl -X POST "$URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"CREATE OR REPLACE FUNCTION is_admin(user_id uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$ SELECT (auth.jwt()->'\''user_metadata'\''->>'\'role'\'') = '\''admin'\''; $$"}'

echo "Done!"
