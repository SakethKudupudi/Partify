#!/usr/bin/env node

/**
 * Create users in Supabase Auth and Database
 * This script properly creates authentication users
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';

const users = [
  {
    email: 'admin@test.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin',
    phone: '+919876543210'
  },
  {
    email: 'vendor@test.com',
    password: 'Vendor@123456',
    name: 'Vendor User',
    role: 'vendor',
    phone: '+919876543211',
    store_name: 'Tech Components Store'
  },
  {
    email: 'customer@test.com',
    password: 'Customer@123456',
    name: 'Customer User',
    role: 'customer',
    phone: '+919876543212'
  }
];

// First delete existing users from database (if needed)
const deleteExistingUsers = async () => {
  try {
    console.log('\n🗑️  Checking for existing users to clean up...\n');

    // This would require a DELETE endpoint - for now we'll skip
    console.log('Skipping deletion (requires admin access to database)\n');
  } catch (error) {
    console.warn('Warning:', error.message);
  }
};

async function createUser(user) {
  try {
    console.log(`\n📝 Creating ${user.role} user: ${user.email}`);

    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, user, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Successfully created: ${user.email}`);
    console.log(`   User ID: ${response.data.user.id}`);
    console.log(`   Role: ${response.data.user.role}`);

    return response.data.user;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;

    if (errorMsg.includes('already')) {
      console.log(`⚠️  User already exists: ${user.email}`);
      return null;
    }

    console.error(`❌ Error creating ${user.email}: ${errorMsg}`);
    return null;
  }
}

async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('🔐 PARTIFY - USER CREATION SCRIPT');
  console.log('='.repeat(50));

  console.log(`\nConnecting to backend at: ${BACKEND_URL}`);

  try {
    const health = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend is running\n');
  } catch (error) {
    console.error('\n❌ Backend is not running!');
    console.error('   Start backend with: cd backend && npm run dev');
    process.exit(1);
  }

  console.log('Creating users...\n');
  console.log('='.repeat(50));

  const createdUsers = [];

  for (const user of users) {
    const result = await createUser(user);
    if (result) {
      createdUsers.push(result);
    }
  }

  console.log('\n' + '='.repeat(50));

  if (createdUsers.length > 0) {
    console.log(`\n✅ Successfully created ${createdUsers.length} user(s)\n`);

    console.log('📋 TEST CREDENTIALS:\n');
    users.forEach(user => {
      const portal = user.role === 'customer' ? '' : user.role;
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Portal: http://localhost:3000${portal ? '/' + portal : ''}`);
      console.log();
    });

    console.log('🚀 Ready to login at: http://localhost:3000/login\n');
    console.log('Steps:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Select role (Admin/Vendor/Customer)');
    console.log('3. Enter email and password from above');
    console.log('4. Click Sign In');
    console.log('5. You\'ll be redirected to your portal\n');
  } else {
    console.log('\n⚠️  No new users were created');
    console.log('   (Users might already exist)\n');
  }

  console.log('='.repeat(50) + '\n');
}

main().catch(error => {
  console.error('\nFatal error:', error.message);
  process.exit(1);
});

