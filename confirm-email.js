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

console.log('Confirming vendor@store.com email...\n');

(async () => {
  try {
    const userId = '53c99dd0-c862-464e-b844-949d3b5e96c2';

    // Update user to confirm email
    const updateResponse = await axios.put(
      `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      { email_confirm: true },
      {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE}`,
          'apikey': SERVICE_ROLE,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Email confirmed!\n');
    console.log('You can now login with:');
    console.log('  Email: vendor@store.com');
    console.log('  Password: Vendor@123456\n');
    console.log('Go to: http://localhost:3000/login');
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();

