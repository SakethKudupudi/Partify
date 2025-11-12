import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { verifyToken, verifyVendor } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Vendor: Get their own inventory
router.get('/', verifyToken, verifyVendor, async (req, res) => {
  const supabase = getSupabase();
  const { user } = req;

  const { data, error } = await supabase
    .from('vendor_inventory')
    .select(`
      *,
      phone_models(name, brand_id),
      components(category, name),
      vendors(store_name)
    `)
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

// Vendor: Get low stock items
router.get('/low-stock', verifyToken, verifyVendor, async (req, res) => {
  const supabase = getSupabase();
  const { user } = req;

  const { data, error } = await supabase
    .from('vendor_inventory')
    .select(`
      *,
      phone_models(name, brand_id),
      components(category, name)
    `)
    .eq('vendor_id', user.id)
    .lt('quantity', 10)
    .order('quantity', { ascending: true });

  if (error) throw error;
  res.json(data);
});

// Vendor: Add/Update inventory
router.post('/', verifyToken, verifyVendor, async (req, res) => {
  const supabase = getSupabase();
  const { user } = req;
  const { phone_model_id, component_id, quantity, proposed_price } = req.body;

  if (!phone_model_id || !component_id || quantity === undefined || !proposed_price) {
    return res.status(400).json({
      error: 'phone_model_id, component_id, quantity, and proposed_price are required'
    });
  }

  // Check if inventory entry exists
  const { data: existing, error: searchError } = await supabase
    .from('vendor_inventory')
    .select('id')
    .eq('vendor_id', user.id)
    .eq('phone_model_id', phone_model_id)
    .eq('component_id', component_id)
    .single();

  if (!searchError && existing) {
    // Update existing
    const { data, error } = await supabase
      .from('vendor_inventory')
      .update({
        quantity,
        proposed_price,
        status: 'pending_approval',
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select();

    if (error) throw error;
    return res.json(data[0]);
  }

  // Create new
  const { data, error } = await supabase
    .from('vendor_inventory')
    .insert([{
      id: uuidv4(),
      vendor_id: user.id,
      phone_model_id,
      component_id,
      quantity,
      proposed_price,
      status: 'pending_approval',
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  res.status(201).json(data[0]);
});

// Vendor: Update quantity
router.patch('/:id/quantity', verifyToken, verifyVendor, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const supabase = getSupabase();
  const { user } = req;

  // Verify ownership
  const { data: inventory } = await supabase
    .from('vendor_inventory')
    .select('vendor_id')
    .eq('id', id)
    .single();

  if (inventory?.vendor_id !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('vendor_inventory')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  res.json(data[0]);
});

export default router;

