#!/bin/bash

# PARTIFY - FIX AUTHENTICATION (Copy-Paste Commands)

echo "
╔════════════════════════════════════════════════════════════════╗
║   PARTIFY - FIX AUTHENTICATION SETUP                           ║
║   Follow these steps exactly                                   ║
╚════════════════════════════════════════════════════════════════╝
"

echo "
STEP 1: DELETE OLD USERS FROM DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://app.supabase.com
2. Select: lrvpokxcbnrxohwqnnmz
3. Click: SQL Editor → New Query
4. Copy & Paste this:
"

cat << 'SQL'
DELETE FROM users WHERE email IN ('admin@partify.com', 'vendor@store.com', 'customer@email.com');
SELECT COUNT(*) FROM users;
SQL

echo "
5. Click: RUN
6. Result should show: 0

Press Enter when done...
"
read -p ""

echo "
STEP 2: START BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Opening new terminal window (Terminal 1)...
Run this command:
"

echo "cd /Users/saketh/project_codes/pilot_project/partify/backend && npm run dev"

echo "
Wait for message: ✅ Partify Backend running on http://localhost:8080

Press Enter when backend is running...
"
read -p ""

echo "
STEP 3: CREATE USERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Opening new terminal window (Terminal 2)...
Run this command:
"

echo "cd /Users/saketh/project_codes/pilot_project/partify && node create-auth-users.js"

echo "
Wait for output showing 3 users created.

Press Enter when script completes...
"
read -p ""

echo "
STEP 4: VERIFY IN SUPABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to Supabase Dashboard
2. Click: Authentication
3. Click: Users tab
4. You should see 3 users:
   ✓ admin@partify.com
   ✓ vendor@store.com
   ✓ customer@email.com

Press Enter when verified...
"
read -p ""

echo "
STEP 5: TEST LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Go to: http://localhost:3000/login

Test with:
  Email: admin@partify.com
  Password: Admin@123456
  Role: admin

Click: Sign In

Expected: Redirected to http://localhost:3000/admin ✅

Press Enter when login works...
"
read -p ""

echo "
╔════════════════════════════════════════════════════════════════╗
║   ✅ AUTHENTICATION IS NOW WORKING!                            ║
╚════════════════════════════════════════════════════════════════╝

📋 TEST CREDENTIALS:

  ADMIN:
    Email: admin@partify.com
    Password: Admin@123456
    Portal: http://localhost:3000/admin

  VENDOR:
    Email: vendor@store.com
    Password: Vendor@123456
    Portal: http://localhost:3000/vendor

  CUSTOMER:
    Email: customer@email.com
    Password: Customer@123456
    Portal: http://localhost:3000/

🚀 You can now login and access all portals!

Enjoy! 🎉
"

