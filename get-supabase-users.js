const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAuthUsers() {
  console.log('📋 Fetching users from Supabase Auth...\n');
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (users.length === 0) {
      console.log('⚠️  No users found in Supabase Auth.');
      console.log('\n📝 Create users manually in Supabase Dashboard:');
      console.log('   1. Go to Authentication → Users');
      console.log('   2. Click "Add user" → "Create new user"');
      console.log('   3. Create these users with passwords:');
      console.log('      - admin@partify.com / Admin@123456');
      console.log('      - vendor@store.com / Vendor@123456');
      console.log('      - customer@email.com / Customer@123456');
      console.log('   4. Check "Auto Confirm User" for each');
      console.log('   5. Run this script again to get their UUIDs\n');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   UUID: ${user.id}`);
      console.log(`   Confirmed: ${user.email_confirmed_at ? '✓' : '✗'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    // Generate SQL inserts
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Copy and run this SQL in Supabase SQL Editor:\n');
    console.log('-- Insert user profiles into users table');
    
    users.forEach(user => {
      const email = user.email.toLowerCase();
      let name = 'User';
      let role = 'customer';
      
      if (email.includes('admin')) {
        name = 'Admin User';
        role = 'admin';
      } else if (email.includes('vendor')) {
        name = 'Vendor Store';
        role = 'vendor';
      } else if (email.includes('customer')) {
        name = 'John Customer';
        role = 'customer';
      }
      
      console.log(`\n-- ${email}`);
      console.log(`INSERT INTO users (id, email, name, role, is_active)`);
      console.log(`VALUES ('${user.id}', '${user.email}', '${name}', '${role}', true)`);
      console.log(`ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;`);
      
      // Add vendor entry if it's a vendor
      if (role === 'vendor') {
        console.log(`\nINSERT INTO vendors (id, user_id, store_name, email, is_active)`);
        console.log(`VALUES (gen_random_uuid(), '${user.id}', 'Tech Components Store', '${user.email}', true)`);
        console.log(`ON CONFLICT (user_id) DO UPDATE SET store_name = EXCLUDED.store_name;`);
      }
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAuthUsers();
