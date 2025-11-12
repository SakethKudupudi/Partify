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

console.log('Listing all Supabase Auth users...\n');

(async () => {
  try {
    const response = await axios.get(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE}`,
          'apikey': SERVICE_ROLE
        }
      }
    );

    if (response.data && response.data.users) {
      console.log(`Found ${response.data.users.length} users:\n`);
      response.data.users.forEach(user => {
        console.log(`✓ ${user.email} (ID: ${user.id})`);
        console.log(`  Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('No users found');
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();

