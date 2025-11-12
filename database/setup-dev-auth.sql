-- Partify Development Auth Setup
-- Run this in Supabase SQL Editor for quick development setup

-- Step 1: Disable RLS for all tables (DEVELOPMENT ONLY!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE phone_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE components DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Step 2: Create or update users table if needed
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: After creating users in Supabase Dashboard, insert their profiles here
-- Replace the UUIDs with actual user IDs from Supabase Dashboard

-- Admin profile (replace USER_ID_HERE with actual ID from Supabase Dashboard)
-- INSERT INTO users (id, email, name, role, is_active)
-- VALUES 
--   ('USER_ID_HERE', 'admin@partify.com', 'Admin User', 'admin', true);

-- Vendor profile (replace USER_ID_HERE with actual ID from Supabase Dashboard)
-- INSERT INTO users (id, email, name, role, is_active)
-- VALUES 
--   ('USER_ID_HERE', 'vendor@store.com', 'Vendor Store', 'vendor', true);

-- Vendor store details
-- INSERT INTO vendors (id, user_id, store_name, email, is_active)
-- VALUES 
--   (gen_random_uuid(), 'USER_ID_HERE', 'Tech Components Store', 'vendor@store.com', true);

-- Customer profile (replace USER_ID_HERE with actual ID from Supabase Dashboard)
-- INSERT INTO users (id, email, name, role, is_active)
-- VALUES 
--   ('USER_ID_HERE', 'customer@email.com', 'John Customer', 'customer', true);

-- Step 4: Verify the setup
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  au.confirmed_at,
  au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.role;

-- Step 5: Check vendors
SELECT 
  v.id,
  v.store_name,
  v.email,
  u.name as owner_name,
  v.is_active
FROM vendors v
LEFT JOIN users u ON v.user_id = u.id;

COMMENT ON TABLE users IS 'Disable RLS before production! This is for development only.';
