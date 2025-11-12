-- Partify User Profiles Setup
-- Run this in Supabase SQL Editor to create user profiles

-- First, disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;

-- Insert admin user profile
INSERT INTO users (id, email, name, role, is_active)
VALUES ('3052f542-8eea-42a6-a878-0788e908a947', 'admin@test.com', 'Admin User', 'admin', true)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

-- Insert vendor user profile (vendor@test.com)
INSERT INTO users (id, email, name, role, is_active)
VALUES ('0ac3a47e-74cb-405c-af35-94f6b21b2b7a', 'vendor@test.com', 'Vendor Store', 'vendor', true)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

-- Create vendor store entry for vendor@test.com
INSERT INTO vendors (id, user_id, store_name, email, is_active)
VALUES (gen_random_uuid(), '0ac3a47e-74cb-405c-af35-94f6b21b2b7a', 'Tech Components Store A', 'vendor@test.com', true)
ON CONFLICT (user_id) DO UPDATE SET store_name = EXCLUDED.store_name, email = EXCLUDED.email;

-- Insert vendor user profile (vendor@store.com)
INSERT INTO users (id, email, name, role, is_active)
VALUES ('53c99dd0-c862-464e-b844-949d3b5e96c2', 'vendor@store.com', 'Vendor Store', 'vendor', true)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

-- Create vendor store entry for vendor@store.com
INSERT INTO vendors (id, user_id, store_name, email, is_active)
VALUES (gen_random_uuid(), '53c99dd0-c862-464e-b844-949d3b5e96c2', 'Tech Components Store B', 'vendor@store.com', true)
ON CONFLICT (user_id) DO UPDATE SET store_name = EXCLUDED.store_name, email = EXCLUDED.email;

-- Insert customer user profile
INSERT INTO users (id, email, name, role, is_active)
VALUES ('4fbd0283-ba13-48d7-b216-c7ed03f7bc8d', 'customer@test.com', 'John Customer', 'customer', true)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;

-- Verify the setup
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  'User exists in both auth and users table' as status
FROM users u
ORDER BY u.role;

-- Check vendors
SELECT 
  v.id,
  v.store_name,
  v.email,
  u.name as owner_name,
  v.is_active
FROM vendors v
LEFT JOIN users u ON v.user_id = u.id;
