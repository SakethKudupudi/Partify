import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Get dashboard stats
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  const supabase = getSupabase();

  try {
    // Total brands
    const { data: brandData } = await supabase
      .from('brands')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Total phone models
    const { data: modelData } = await supabase
      .from('phone_models')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Total components
    const { data: componentData } = await supabase
      .from('components')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Pending vendor requests
    const { data: pendingData } = await supabase
      .from('vendor_inventory')
      .select('id', { count: 'exact' })
      .eq('status', 'pending_approval');

    // Total orders
    const { data: orderData } = await supabase
      .from('orders')
      .select('id', { count: 'exact' });

    // Total vendors
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    res.json({
      total_brands: brandData?.length || 0,
      total_phone_models: modelData?.length || 0,
      total_components: componentData?.length || 0,
      pending_vendor_requests: pendingData?.length || 0,
      total_orders: orderData?.length || 0,
      total_vendors: vendorData?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent orders
router.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
  const supabase = getSupabase();
  const limit = req.query.limit || 10;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(count)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  res.json(data);
});

// Get vendor performance
router.get('/vendors/performance', verifyToken, verifyAdmin, async (req, res) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('vendors')
    .select(`
      id,
      store_name,
      email,
      vendor_inventory(count),
      orders(count)
    `)
    .eq('is_active', true);

  if (error) throw error;
  res.json(data);
});

// Get component sales summary
router.get('/components/sales', verifyToken, verifyAdmin, async (req, res) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      vendor_inventory(
        components(name, category)
      )
    `);

  if (error) throw error;

  // Group by component
  const summary = {};
  data?.forEach(item => {
    const component = item.vendor_inventory?.components;
    if (component) {
      if (!summary[component.name]) {
        summary[component.name] = {
          name: component.name,
          category: component.category,
          total_sold: 0
        };
      }
      summary[component.name].total_sold += item.quantity;
    }
  });

  res.json(Object.values(summary));
});

export default router;

