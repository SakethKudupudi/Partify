import { getSupabase } from '../config/supabase.js';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user profile from database
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      ...userProfile
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
}

export async function verifyAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export async function verifyVendor(req, res, next) {
  if (req.user?.role !== 'vendor') {
    return res.status(403).json({ error: 'Vendor access required' });
  }

  // Fetch vendor_id from vendors table
  try {
    const supabase = getSupabase();
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (error || !vendor) {
      return res.status(403).json({ error: 'Vendor profile not found' });
    }

    req.user.vendor_id = vendor.id;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify vendor' });
  }
}

export async function verifyCustomer(req, res, next) {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ error: 'Customer access required' });
  }
  next();
}

