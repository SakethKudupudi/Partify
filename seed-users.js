#!/usr/bin/env node

/**
 * Partify - User Seeding Script
 *
 * This script creates test users in Supabase Auth and users table
 *
 * Usage: node seed-users.js
 *
 * Make sure:
 * 1. Backend is running (npm run dev in backend folder)
 * 2. .env.local has Supabase credentials
 * 3. Database schema is created
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';

const testUsers = [
  {
    email: 'admin@partify.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin',
    phone: '+919876543210'
  },
  {
    email: 'vendor@store.com',
    password: 'Vendor@123456',
    name: 'Vendor User',
    role: 'vendor',
    phone: '+919876543211',
    store_name: 'Tech Components Store'
  },
  {
    email: 'customer@email.com',
    password: 'Customer@123456',
    name: 'Customer User',
    role: 'customer',
    phone: '+919876543212'
  }
];

async function createUser(user) {
  try {
    console.log(`\n📝 Creating ${user.role} user: ${user.email}`);

    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, user, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Successfully created: ${user.email}`);
    console.log(`   Role: ${response.data.user.role}`);
    console.log(`   User ID: ${response.data.user.id}`);

    return response.data.user;
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.error?.includes('already')) {
      console.log(`⚠️  User already exists: ${user.email}`);
      return null;
    }
    console.error(`❌ Error creating ${user.email}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function seedUsers() {
  console.log('🌱 Partify User Seeding Script\n');
  console.log(`Connecting to backend at: ${BACKEND_URL}\n`);

  try {
    // Check if backend is running
    await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running\n');
  } catch (error) {
    console.error('❌ Backend is not running!');
    console.error('   Start backend with: cd backend && npm run dev');
    process.exit(1);
  }

  console.log('Creating test users...\n');
  console.log('==========================================\n');

  const createdUsers = [];

  for (const user of testUsers) {
    const result = await createUser(user);
    if (result) {
      createdUsers.push(result);
    }
  }

  console.log('\n==========================================\n');

  if (createdUsers.length > 0) {
    console.log(`✅ Successfully created ${createdUsers.length} user(s)\n`);

    console.log('📋 Test Credentials:\n');
    testUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Portal: http://localhost:3000/${user.role === 'customer' ? '' : user.role}`);
      console.log();
    });

    console.log('🚀 Ready to login at: http://localhost:3000/login');
  } else {
    console.log('⚠️  No new users were created');
    console.log('   (All users might already exist)');
  }
}

// Run the seeding
seedUsers().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});

