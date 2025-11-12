import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  const supabase = getSupabase();

  if (!email || !password || !name || !role) {
    return res.status(400).json({
      error: 'email, password, name, and role are required'
    });
  }

  if (!['admin', 'vendor', 'customer'].includes(role)) {
    return res.status(400).json({
      error: 'Role must be admin, vendor, or customer'
    });
  }

  try {
    // Create Supabase auth user with service role (bypasses email confirmation)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        email,
        name,
        role,
        is_active: true,
        created_at: new Date().toISOString()
      }]);

    if (profileError) {
      // Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    // If vendor, create vendor profile
    if (role === 'vendor') {
      const { store_name } = req.body;
      await supabase
        .from('vendors')
        .insert([{
          id: uuidv4(),
          user_id: authUser.user.id,
          store_name: store_name || name,
          email,
          is_active: true,
          created_at: new Date().toISOString()
        }]);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        name,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const supabase = getSupabase();

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...userProfile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const supabase = getSupabase();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        ...userProfile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

