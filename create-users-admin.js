#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

// Read .env.local
const envContent = fs.readFileSync('./.env.local', 'utf8');
const SUPABASE_URL = envContent.match(/SUPABASE_URL=(.+)/)[1];
const SUPABASE_SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1];

const users = [
  {
    email: 'admin@test.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'vendor@test.com',
    password: 'Vendor@123456',
    name: 'Vendor User',
    role: 'vendor'
  },
  {
    email: 'customer@test.com',
    password: 'Customer@123456',
    name: 'Customer User',
    role: 'customer'
  }
];

async function createAuthUser(user) {
  try {
    const { data, error } = await axios.post(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Created: ${user.email} (ID: ${data.id})`);
    return { ...user, id: data.id };
  } catch (error) {
    console.error(`❌ Error creating ${user.email}:`, error.response?.data?.msg || error.message);
    return null;
  }
}

async function createDatabaseUser(user, authUserId) {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/auth/login`,
      {
        email: user.email,
        password: user.password
      }
    );

    console.log(`✅ Database user created for ${user.email}`);
    return true;
  } catch (error) {
    console.error(`⚠️ Database user might already exist: ${user.email}`);
    return false;
  }
}

async function main() {
  console.log('\n🔐 Creating users in Supabase Auth...\n');

  for (const user of users) {
    const authUser = await createAuthUser(user);
    if (authUser) {
      await new Promise(r => setTimeout(r, 500));
      await createDatabaseUser(user, authUser.id);
    }
  }

  console.log('\n✅ Users created!\n');
  console.log('Login at: http://localhost:3000/login\n');
  console.log('Credentials:');
  console.log('  admin@test.com / Admin@123456');
  console.log('  vendor@test.com / Vendor@123456');
  console.log('  customer@test.com / Customer@123456\n');
}

main().catch(console.error);

