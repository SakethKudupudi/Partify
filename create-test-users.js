// ==========================================
// PARTIFY - Create Test Users in Supabase
// ==========================================
// Run: node create-test-users.js

const BACKEND_URL = 'http://localhost:8080';

const users = [
  {
    email: 'admin@partify.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'vendor@store.com',
    password: 'Vendor@123456',
    name: 'Vendor Store',
    role: 'vendor',
    store_name: 'Tech Components Store'
  },
  {
    email: 'customer@email.com',
    password: 'Customer@123456',
    name: 'John Customer',
    role: 'customer'
  }
];

async function createUser(user) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Created ${user.role}: ${user.email}`);
      return true;
    } else {
      console.log(`⚠️  ${user.role} (${user.email}): ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error creating ${user.role}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating Partify Test Users in Supabase...\n');

  for (const user of users) {
    await createUser(user);
  }

  console.log('\n✅ Done!\n');
  console.log('Test Credentials:');
  console.log('==================');
  console.log('Admin:    admin@partify.com / Admin@123456');
  console.log('Vendor:   vendor@store.com / Vendor@123456');
  console.log('Customer: customer@email.com / Customer@123456');
  console.log('\nYou can now login at: http://localhost:3000/login');
}

main();
