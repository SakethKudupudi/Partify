import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Component categories (hardware components for phones)
const COMPONENT_CATEGORIES = [
  'Screen/LCD',
  'Touch Digitizer',
  'Screen Protector',
  'Battery',
  'Battery Connector',
  'Charging Port',
  'Earpiece Speaker',
  'Loudspeaker',
  'Microphone',
  'Buzzer',
  'Headphone Jack',
  'Rear Camera',
  'Front Camera',
  'Antenna',
  'SIM Connector',
  'WiFi Circuit',
  'Bluetooth Module',
  'GPS Module',
  'Back Cover',
  'Housing',
  'Vibrator',
  'Home Button',
  'Side Buttons',
  'Motherboard',
  'Processor',
  'RAM',
  'ROM',
  'GPU',
  'Flex Cable'
];

// Get all components
router.get('/', async (req, res) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });

  if (error) throw error;
  res.json(data);
});

// Get component categories
router.get('/categories', (req, res) => {
  res.json({ categories: COMPONENT_CATEGORIES });
});

// Get specific component
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) {
    return res.status(404).json({ error: 'Component not found' });
  }
  res.json(data);
});

// Admin: Create component
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { category, name, description, image_url } = req.body;
  const supabase = getSupabase();

  if (!category || !name) {
    return res.status(400).json({ error: 'Category and name are required' });
  }

  const { data, error } = await supabase
    .from('components')
    .insert([{
      id: uuidv4(),
      category,
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

// Admin: Update component
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { category, name, description, image_url, is_active } = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('components')
    .update({
      category,
      name,
      description,
      image_url,
      is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return res.status(404).json({ error: 'Component not found' });
  }
  res.json(data[0]);
});

// Admin: Delete component
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from('components')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
  res.json({ message: 'Component deactivated' });
});

export default router;

