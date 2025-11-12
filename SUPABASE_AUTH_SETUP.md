# Supabase Auth Setup Guide for Partify

## Prerequisites
- Supabase project created
- Service role key configured in `.env.local`

## Step 1: Disable Email Confirmation (Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, toggle OFF "Confirm email"
4. Under **Email Auth**, toggle OFF "Secure email change"
5. Click **Save**

## Step 2: Configure RLS Policies for Users Table

Run this SQL in Supabase SQL Editor:

```sql
-- Disable RLS temporarily for user creation
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or create proper policies:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert users
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to select all users
CREATE POLICY "Service role can view all users" ON users
  FOR SELECT
  TO service_role
  USING (true);

-- Allow authenticated users to view their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

## Step 3: Configure RLS Policies for Vendors Table

```sql
-- Vendors table policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Service role can manage vendors
CREATE POLICY "Service role can manage vendors" ON vendors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vendors can view their own profile
CREATE POLICY "Vendors can view own profile" ON vendors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Vendors can update their own profile
CREATE POLICY "Vendors can update own profile" ON vendors
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
```

## Step 4: Create Test Users via Supabase Dashboard

### Option A: Using Supabase Dashboard (Recommended for Development)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. For each user:

**Admin User:**
- Email: `admin@partify.com`
- Password: `Admin@123456`
- Auto Confirm User: ✓ (check this)
- Click **Create user**
- Copy the user ID

Then run this SQL with the copied ID:
```sql
INSERT INTO users (id, email, name, role, is_active)
VALUES 
  ('PASTE_ADMIN_USER_ID_HERE', 'admin@partify.com', 'Admin User', 'admin', true);
```

**Vendor User:**
- Email: `vendor@store.com`
- Password: `Vendor@123456`
- Auto Confirm User: ✓
- Click **Create user**
- Copy the user ID

Then run:
```sql
INSERT INTO users (id, email, name, role, is_active)
VALUES 
  ('PASTE_VENDOR_USER_ID_HERE', 'vendor@store.com', 'Vendor Store', 'vendor', true);

INSERT INTO vendors (id, user_id, store_name, email, is_active)
VALUES 
  (gen_random_uuid(), 'PASTE_VENDOR_USER_ID_HERE', 'Tech Components Store', 'vendor@store.com', true);
```

**Customer User:**
- Email: `customer@email.com`
- Password: `Customer@123456`
- Auto Confirm User: ✓
- Click **Create user**
- Copy the user ID

Then run:
```sql
INSERT INTO users (id, email, name, role, is_active)
VALUES 
  ('PASTE_CUSTOMER_USER_ID_HERE', 'customer@email.com', 'John Customer', 'customer', true);
```

### Option B: Using the API (After RLS is configured)

Make sure your backend is running, then run:
```bash
node create-test-users.js
```

## Step 5: Test Login

1. Go to http://localhost:3000/login
2. Try logging in with:
   - **Admin**: admin@partify.com / Admin@123456
   - **Vendor**: vendor@store.com / Vendor@123456
   - **Customer**: customer@email.com / Customer@123456

## Step 6: Verify Auth Flow

After successful login:
- Admin should redirect to `/admin`
- Vendor should redirect to `/vendor`
- Customer should redirect to `/` (home)

## Troubleshooting

### Error: "Email address is invalid"
- Go to Authentication → Settings
- Check Email Provider settings
- Ensure you have SMTP configured or use Supabase's built-in email service

### Error: "Row-level security policy violation"
- Check RLS policies on `users` and `vendors` tables
- Temporarily disable RLS for development:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
  ```
- **Warning**: Only do this in development!

### Error: "Missing Supabase configuration"
- Check `.env.local` file has:
  ```
  SUPABASE_URL=your_supabase_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  SUPABASE_ANON_KEY=your_anon_key
  ```

### Users Created But Can't Login
- Check if users are confirmed in Supabase Dashboard
- Go to Authentication → Users
- Look for "Confirmed" status
- If not confirmed, click the user and confirm manually

## Production Considerations

For production:
1. **Enable email confirmation**
2. **Enable RLS on all tables**
3. **Create specific policies for each role**
4. **Use environment-specific credentials**
5. **Enable MFA (Multi-Factor Authentication)**
6. **Set up proper SMTP**
7. **Configure password policies**

## Quick SQL Script for Development

Run this in Supabase SQL Editor to set up everything:

```sql
-- Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE phone_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE components DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Note: Remember to enable RLS and create proper policies before production!
```

## Next Steps

After setting up auth:
1. Test all three user roles
2. Verify role-based routing works
3. Test API endpoints with Bearer tokens
4. Create additional test data (brands, models, components)
