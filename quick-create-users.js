#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

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
    role: 'vendor',
    store_name: 'Tech Components Store'
  },
  {
    email: 'customer@test.com',
    password: 'Customer@123456',
    name: 'Customer User',
    role: 'customer'
  }
];

async function createUser(user) {
  console.log(`\n📝 Creating ${user.role}: ${user.email}`);
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already')) {
        console.log(`⚠️  User already exists: ${user.email}`);
        return;
      }
      throw authError;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: true,
        created_at: new Date().toISOString()
      }]);

    if (profileError) {
      console.error(`❌ Profile error for ${user.email}:`, profileError.message);
      return;
    }

    // If vendor, create vendor profile
    if (user.role === 'vendor') {
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert([{
          user_id: authData.user.id,
          store_name: user.store_name || user.name,
          email: user.email,
          is_active: true,
          created_at: new Date().toISOString()
        }]);

      if (vendorError) {
        console.error(`⚠️  Vendor profile error:`, vendorError.message);
      }
    }

    console.log(`✅ Created: ${user.email} (${user.role})`);
  } catch (error) {
    console.error(`❌ Error creating ${user.email}:`, error.message);
  }
}

async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('🔐 QUICK USER CREATION');
  console.log('='.repeat(50));

  for (const user of users) {
    await createUser(user);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ DONE!');
  console.log('='.repeat(50));
  console.log('\n📋 Login Credentials:\n');
  users.forEach(u => {
    console.log(`${u.role.toUpperCase()}: ${u.email} / ${u.password}`);
  });
  console.log('');
}

main().catch(console.error);
