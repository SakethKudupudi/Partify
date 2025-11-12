import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get phone models by brand
router.get('/brand/:brandId', async (req, res) => {
  const { brandId } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('phone_models')
    .select('*')
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  res.json(data);
});

// Get all phone models with brand info
router.get('/', async (req, res) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('phone_models')
    .select(`
      *,
      brands(name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

// Get specific phone model
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('phone_models')
    .select(`
      *,
      brands(id, name),
      phone_model_components(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) {
    return res.status(404).json({ error: 'Phone model not found' });
  }
  res.json(data);
});

// Admin: Create phone model
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { brand_id, name, model_number, specification, image_url } = req.body;
  const supabase = getSupabase();

  if (!brand_id || !name) {
    return res.status(400).json({ error: 'Brand ID and name are required' });
  }

  const { data, error } = await supabase
    .from('phone_models')
    .insert([{
      id: uuidv4(),
      brand_id,
      name,
      model_number,
      specification,
      image_url,
      is_active: true,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  res.status(201).json(data[0]);
});

// Admin: Update phone model
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, model_number, specification, image_url, is_active } = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('phone_models')
    .update({
      name,
      model_number,
      specification,
      image_url,
      is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return res.status(404).json({ error: 'Phone model not found' });
  }
  res.json(data[0]);
});

// Admin: Delete phone model
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from('phone_models')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
  res.json({ message: 'Phone model deactivated' });
});

export default router;

