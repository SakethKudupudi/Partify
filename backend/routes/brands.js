import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all brands
router.get('/', async (req, res) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  res.json(data);
});

// Admin: Create brand
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { name, description, image_url } = req.body;
  const supabase = getSupabase();

  if (!name) {
    return res.status(400).json({ error: 'Brand name is required' });
  }

  const { data, error } = await supabase
    .from('brands')
    .insert([{
      id: uuidv4(),
      name,
      description,
      image_url,
      is_active: true,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  res.status(201).json(data[0]);
});

// Admin: Update brand
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, is_active } = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('brands')
    .update({ name, description, image_url, is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return res.status(404).json({ error: 'Brand not found' });
  }
  res.json(data[0]);
});

// Admin: Delete brand
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from('brands')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
  res.json({ message: 'Brand deactivated' });
});

export default router;

