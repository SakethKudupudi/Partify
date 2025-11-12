import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Admin: Get pending vendor requests
router.get('/pending', verifyToken, verifyAdmin, async (req, res) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('vendor_inventory')
    .select(`
      *,
      phone_models(name, brand_id),
      components(category, name),
      vendors(store_name, email)
    `)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true });

  if (error) throw error;
  res.json(data);
});

// Admin: Get all vendor requests
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  const supabase = getSupabase();
  const { status } = req.query;

  let query = supabase
    .from('vendor_inventory')
    .select(`
      *,
      phone_models(name, brand_id),
      components(category, name),
      vendors(store_name, email)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
});

// Admin: Approve vendor request
router.post('/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('vendor_inventory')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: req.user.id
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json({ message: 'Request approved', data: data[0] });
});

// Admin: Reject vendor request
router.post('/:id/reject', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('vendor_inventory')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
      rejected_by: req.user.id
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json({ message: 'Request rejected', data: data[0] });
});

// Admin: Get vendor sales
router.get('/:vendorId/sales', verifyToken, verifyAdmin, async (req, res) => {
  const { vendorId } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      vendor_inventory(
        proposed_price,
        phone_models(name),
        components(name)
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

export default router;

