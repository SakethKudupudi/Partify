#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match && !line.startsWith('#')) {
    env[match[1]] = match[2];
  }
});

console.log('\n🔍 Testing Supabase Client Connection...\n');

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('Configuration:');
    console.log(`  URL: ${env.SUPABASE_URL}`);
    console.log(`  Service Role: ${env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 50)}...\n`);

    // Test Auth
    console.log('Testing Auth...');
    const { data, error: authError } = await supabase.auth.admin.listUsers();
    const authUsers = data?.users || [];
    console.log(`✅ Auth working - ${authUsers.length} users in Supabase Auth\n`);

    authUsers.forEach(user => {
      console.log(`  • ${user.email} (Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'})`);
    });

    // Test Database
    console.log('\nTesting Database...');
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      console.error(`❌ Database error: ${error.message}`);
    } else {
      console.log(`✅ Database working - ${users.length} users found\n`);
      users.forEach(user => {
        console.log(`  • ${user.email} (Role: ${user.role})`);
      });
    }

    console.log('\n🎉 Supabase client configured correctly!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();

