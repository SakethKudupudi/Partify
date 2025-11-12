#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

// Parse .env.local
const envLines = fs.readFileSync('./.env.local', 'utf8').split('\n');
const env = {};
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Creating users directly in Supabase...\n');

const users = [
  { email: 'admin@test.com', password: 'Admin@123456' },
  { email: 'vendor@test.com', password: 'Vendor@123456' },
  { email: 'customer@test.com', password: 'Customer@123456' }
];

async function createUser(user) {
  try {
    const response = await axios.post(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.email.split('@')[0]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ ${user.email}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.msg?.includes('already')) {
      console.log(`⚠️  ${user.email} (already exists)`);
    } else {
      console.log(`❌ ${user.email}: ${err.response?.data?.msg || err.message}`);
    }
    return null;
  }
}

(async () => {
  for (const user of users) {
    await createUser(user);
  }

  console.log('\nDone!\n');
  console.log('Login at: http://localhost:3000/login');
  console.log('Credentials:');
  users.forEach(u => console.log(`  ${u.email} / ${u.password}`));
})();

