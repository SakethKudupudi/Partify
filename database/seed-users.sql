-- ==========================================
-- PARTIFY - USER SEEDING SCRIPT
-- Supabase SQL
-- ==========================================
-- This script adds test users to the users table
-- NOTE: These should be created via Supabase Auth API first,
-- then linked to this users table

-- ==========================================
-- STEP 1: Clear existing test users (optional)
-- ==========================================
-- DELETE FROM users WHERE email IN (
--   'admin@partify.com',
--   'vendor@store.com',
--   'customer@email.com'
-- );

-- ==========================================
-- STEP 2: Insert Admin User
-- ==========================================
-- First create in Supabase Auth, then add to users table
-- Using a placeholder UUID - replace with actual UUID from Supabase Auth

INSERT INTO users (
  id,
  email,
  name,
  phone,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),  -- Replace with actual UUID from Supabase Auth
  'admin@partify.com',
  'Admin User',
  '+919876543210',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- STEP 3: Insert Vendor User
-- ==========================================
INSERT INTO users (
  id,
  email,
  name,
  phone,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),  -- Replace with actual UUID from Supabase Auth
  'vendor@store1.com',
  'Vendor User',
  '+919876543211',
  'vendor',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- STEP 4: Insert Customer User
-- ==========================================
INSERT INTO users (
  id,
  email,
  name,
  phone,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),  -- Replace with actual UUID from Supabase Auth
  'customer@email.com',
  'Customer User',
  '+919876543212',
  'customer',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- STEP 5: Verify users were created
-- ==========================================
SELECT id, email, name, role, is_active, created_at FROM users;

