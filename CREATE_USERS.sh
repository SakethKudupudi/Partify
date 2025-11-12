#!/bin/bash

# PARTIFY - USER CREATION QUICK START
# Copy these commands and run them in your terminal

# ==========================================
# FASTEST METHOD: Node Script
# ==========================================

# Step 1: Start Backend (Terminal 1)
cd /Users/saketh/project_codes/pilot_project/partify/backend
npm run dev

# Wait for: ✅ Partify Backend running on http://localhost:8080

# Step 2: Run Seed Script (Terminal 2)
cd /Users/saketh/project_codes/pilot_project/partify
node seed-users.js

# Expected Output:
# ✅ Backend is running
# 📝 Creating admin user: admin@partify.com
# ✅ Successfully created: admin@partify.com
# ... (and so on for vendor and customer)
# 🚀 Ready to login at: http://localhost:3000/login

# Step 3: Test Login
# Go to: http://localhost:3000/login
# Email: admin@partify.com
# Password: Admin@123456
# Role: admin
# Click: Sign In
# Redirects to: http://localhost:3000/admin ✅

# ==========================================
# ALTERNATIVE: SQL Script Method
# ==========================================

# Step 1: Create Auth Users in Supabase
# 1. Go to: https://app.supabase.com
# 2. Select: lrvpokxcbnrxohwqnnmz
# 3. Authentication → Users
# 4. Click "Add user" and create:
#    - admin@partify.com / Admin@123456
#    - vendor@store.com / Vendor@123456
#    - customer@email.com / Customer@123456
# 5. Copy each User ID (UUID)

# Step 2: Run SQL Script
# 1. Go to: SQL Editor → New Query
# 2. Copy content from: /database/seed-users.sql
# 3. Replace gen_random_uuid() with actual UUIDs
# 4. Click RUN

# ==========================================
# VERIFY USERS CREATED
# ==========================================

# In Supabase SQL Editor, run:
SELECT id, email, name, role FROM users;

# Expected result:
# 3 rows with admin, vendor, customer roles

# ==========================================
# TROUBLESHOOTING
# ==========================================

# If "Backend is not running" error:
cd /Users/saketh/project_codes/pilot_project/partify/backend
npm run dev

# If "Cannot find module" error:
cd /Users/saketh/project_codes/pilot_project/partify
npm install

# If "Port 3000 already in use":
lsof -i :3000
kill -9 <PID>

# If login fails:
# 1. Check user exists in Supabase Auth
# 2. Check user exists in users table
# 3. Check IDs match between Auth and users table
# 4. Check email/password spelling

# ==========================================
# FINAL STATUS
# ==========================================

# After running seed-users.js, you have:
# ✅ 3 users created in Supabase Auth
# ✅ 3 users created in users table
# ✅ All with correct roles (admin, vendor, customer)
# ✅ Ready to login and test all portals
# ✅ Test credentials printed to console

# ==========================================
# QUICK REFERENCE
# ==========================================

# Files:
# - seed-users.js (Node script to create users)
# - database/seed-users.sql (SQL script)
# - ADD_USERS_GUIDE.txt (Detailed instructions)
# - SUPABASE_USER_SCRIPT.txt (Complete reference)

# Commands:
node seed-users.js                    # Create all users (FASTEST)
curl http://localhost:8080/health     # Check backend
http://localhost:3000/login           # Login page

# Credentials:
# Admin: admin@partify.com / Admin@123456
# Vendor: vendor@store.com / Vendor@123456
# Customer: customer@email.com / Customer@123456

# ==========================================

