import { Router } from 'express';
import { verifyToken, verifyVendor } from '../middleware/auth.js';
import { getSupabase } from '../config/supabase.js';

const router = Router();

// Inventory routes
router.get('/inventory', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category)')
      .eq('vendor_id', vendorId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/inventory', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;
    const { phone_model_id, component_id, quantity, proposed_price } = req.body;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .insert([{
        vendor_id: vendorId,
        phone_model_id,
        component_id,
        quantity,
        proposed_price,
        status: 'pending_approval'
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inventory/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Check ownership
    if (data.vendor_id !== req.user.vendor_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Item not found' });
  }
});

router.put('/inventory/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { quantity, proposed_price } = req.body;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .update({ quantity, proposed_price })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inventory/low-stock', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*')
      .eq('vendor_id', vendorId)
      .lt('quantity', 10);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales routes
router.get('/sales/overview', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    // Get total sales
    const { data: orderData, error: orderError } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, proposed_price)')
      .eq('vendor_inventory.vendor_id', vendorId);

    const totalSales = orderData?.reduce((sum, item) => {
      return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
    }, 0) || 0;

    res.json({
      total_sales: totalSales,
      total_orders: orderData?.length || 0,
      inventory_items: 0,
      low_stock_alerts: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/daily', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(vendor_id))')
      .eq('order_items.vendor_inventory.vendor_id', vendorId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/weekly', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(vendor_id))')
      .eq('order_items.vendor_inventory.vendor_id', vendorId)
      .gte('created_at', weekAgo);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/revenue', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(proposed_price)')
      .eq('vendor_inventory.vendor_id', vendorId);

    if (error) throw error;

    const revenue = data?.reduce((sum, item) => {
      return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
    }, 0) || 0;

    res.json({ total_revenue: revenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/analytics/trends', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, order_items(quantity, vendor_inventory(vendor_id, proposed_price))')
      .eq('order_items.vendor_inventory.vendor_id', vendorId);

    if (error) throw error;

    // Process trends
    const trends = data.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const existing = acc.find(t => t.date === date);
      const amount = order.order_items.reduce((sum, item) => {
        return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
      }, 0);

      if (existing) {
        existing.amount += amount;
        existing.orders += 1;
      } else {
        acc.push({ date, amount, orders: 1 });
      }
      return acc;
    }, []);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders
router.get('/orders', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(id, status, created_at), vendor_inventory(vendor_id)')
      .eq('vendor_inventory.vendor_id', vendorId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Requests
router.get('/requests', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ADDITIONAL INVENTORY ROUTES
// ========================================
router.delete('/inventory/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    // Check ownership before deleting
    const { data: item } = await supabase
      .from('vendor_inventory')
      .select('vendor_id')
      .eq('id', req.params.id)
      .single();

    if (!item || item.vendor_id !== vendorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('vendor_inventory')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/inventory/:id/restock', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { quantity } = req.body;

    // Get current quantity
    const { data: current } = await supabase
      .from('vendor_inventory')
      .select('quantity')
      .eq('id', req.params.id)
      .single();

    const newQuantity = (current?.quantity || 0) + quantity;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .update({ quantity: newQuantity })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json({ message: 'Inventory restocked', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inventory/out-of-stock', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category)')
      .eq('vendor_id', vendorId)
      .eq('quantity', 0);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/inventory/bulk-update', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { updates } = req.body; // Array of { id, quantity, proposed_price }
    const vendorId = req.user.vendor_id;

    const results = await Promise.all(updates.map(async (update) => {
      // Verify ownership
      const { data: item } = await supabase
        .from('vendor_inventory')
        .select('vendor_id')
        .eq('id', update.id)
        .single();

      if (!item || item.vendor_id !== vendorId) {
        return { id: update.id, error: 'Unauthorized' };
      }

      const { data, error } = await supabase
        .from('vendor_inventory')
        .update({ quantity: update.quantity, proposed_price: update.proposed_price })
        .eq('id', update.id)
        .select();

      return { id: update.id, success: !error, data: data?.[0] };
    }));

    res.json({ message: 'Bulk update completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// PRICING MANAGEMENT ROUTES
// ========================================
router.get('/pricing', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('id, proposed_price, quantity, phone_models(name), components(name, category)')
      .eq('vendor_id', vendorId)
      .eq('status', 'approved');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/pricing/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { proposed_price } = req.body;
    const vendorId = req.user.vendor_id;

    // Verify ownership
    const { data: item } = await supabase
      .from('vendor_inventory')
      .select('vendor_id')
      .eq('id', req.params.id)
      .single();

    if (!item || item.vendor_id !== vendorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('vendor_inventory')
      .update({ proposed_price })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json({ message: 'Price updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pricing/bulk-edit', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { price_updates } = req.body; // Array of { id, proposed_price }
    const vendorId = req.user.vendor_id;

    const results = await Promise.all(price_updates.map(async (update) => {
      // Verify ownership
      const { data: item } = await supabase
        .from('vendor_inventory')
        .select('vendor_id')
        .eq('id', update.id)
        .single();

      if (!item || item.vendor_id !== vendorId) {
        return { id: update.id, error: 'Unauthorized' };
      }

      const { data, error } = await supabase
        .from('vendor_inventory')
        .update({ proposed_price: update.proposed_price })
        .eq('id', update.id)
        .select();

      return { id: update.id, success: !error, data: data?.[0] };
    }));

    res.json({ message: 'Bulk price update completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pricing/competitive', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    // Get vendor's inventory
    const { data: myInventory } = await supabase
      .from('vendor_inventory')
      .select('component_id, proposed_price, components(name)')
      .eq('vendor_id', vendorId)
      .eq('status', 'approved');

    // Get competitive pricing for each component
    const competitive = await Promise.all(myInventory.map(async (item) => {
      const { data: competitors } = await supabase
        .from('vendor_inventory')
        .select('proposed_price, vendors(store_name)')
        .eq('component_id', item.component_id)
        .eq('status', 'approved')
        .neq('vendor_id', vendorId);

      const prices = competitors?.map(c => c.proposed_price) || [];
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

      return {
        component_id: item.component_id,
        component_name: item.components.name,
        my_price: item.proposed_price,
        min_competitor_price: minPrice,
        max_competitor_price: maxPrice,
        avg_competitor_price: avgPrice,
        competitors_count: competitors.length
      };
    }));

    res.json(competitive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// REQUEST MANAGEMENT ROUTES
// ========================================
router.get('/requests/pending', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category)')
      .eq('vendor_id', vendorId)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/requests/approved', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category)')
      .eq('vendor_id', vendorId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/requests/rejected', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category), rejection_reason')
      .eq('vendor_id', vendorId)
      .eq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/requests/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name, model_number), components(name, category, description)')
      .eq('id', req.params.id)
      .eq('vendor_id', vendorId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Request not found' });
  }
});

// ========================================
// ADDITIONAL SALES & ANALYTICS ROUTES
// ========================================
router.get('/sales/monthly', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, proposed_price), orders(created_at)')
      .eq('vendor_inventory.vendor_id', vendorId)
      .gte('orders.created_at', monthAgo);

    if (error) throw error;

    const totalSales = data.reduce((sum, item) => {
      return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
    }, 0);

    res.json({ period: 'monthly', total_sales: totalSales, orders_count: data.length, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/analytics/top-products', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, component_id, proposed_price, components(name, category))')
      .eq('vendor_inventory.vendor_id', vendorId);

    if (error) throw error;

    // Aggregate by component
    const products = data.reduce((acc, item) => {
      const componentId = item.vendor_inventory?.component_id;
      const componentName = item.vendor_inventory?.components?.name;
      const amount = item.quantity * (item.vendor_inventory?.proposed_price || 0);

      if (componentId) {
        const existing = acc.find(p => p.component_id === componentId);
        if (existing) {
          existing.total_quantity += item.quantity;
          existing.total_revenue += amount;
        } else {
          acc.push({
            component_id: componentId,
            component_name: componentName,
            category: item.vendor_inventory?.components?.category,
            total_quantity: item.quantity,
            total_revenue: amount
          });
        }
      }
      return acc;
    }, []);

    // Sort by revenue
    products.sort((a, b) => b.total_revenue - a.total_revenue);

    res.json(products.slice(0, 10)); // Top 10 products
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/earnings', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;
    const PLATFORM_FEE = 0.10; // 10% platform commission

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, proposed_price)')
      .eq('vendor_inventory.vendor_id', vendorId);

    if (error) throw error;

    const grossRevenue = data.reduce((sum, item) => {
      return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
    }, 0);

    const platformFees = grossRevenue * PLATFORM_FEE;
    const netEarnings = grossRevenue - platformFees;

    res.json({
      gross_revenue: grossRevenue,
      platform_fees: platformFees,
      net_earnings: netEarnings,
      orders_count: data.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/reports/generate', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;
    const { start_date, end_date, format = 'json' } = req.query;

    let query = supabase
      .from('order_items')
      .select('*, vendor_inventory(vendor_id, proposed_price, components(name)), orders(created_at, status)')
      .eq('vendor_inventory.vendor_id', vendorId);

    if (start_date) query = query.gte('orders.created_at', start_date);
    if (end_date) query = query.lte('orders.created_at', end_date);

    const { data, error } = await query;

    if (error) throw error;

    const report = {
      period: { start_date, end_date },
      total_orders: data.length,
      total_revenue: data.reduce((sum, item) => {
        return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
      }, 0),
      orders: data
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ADDITIONAL ORDER ROUTES
// ========================================
router.get('/orders/pending', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(id, status, created_at, users(name, email)), vendor_inventory(vendor_id, components(name))')
      .eq('vendor_inventory.vendor_id', vendorId)
      .eq('orders.status', 'pending');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/processing', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(id, status, created_at), vendor_inventory(vendor_id)')
      .eq('vendor_inventory.vendor_id', vendorId)
      .eq('orders.status', 'processing');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/shipped', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(id, status, created_at), vendor_inventory(vendor_id)')
      .eq('vendor_inventory.vendor_id', vendorId)
      .eq('orders.status', 'shipped');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/delivered', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(id, status, created_at), vendor_inventory(vendor_id)')
      .eq('vendor_inventory.vendor_id', vendorId)
      .eq('orders.status', 'delivered');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/cancelled', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(id, status, created_at), vendor_inventory(vendor_id)')
      .eq('vendor_inventory.vendor_id', vendorId)
      .eq('orders.status', 'cancelled');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// PROFILE & DASHBOARD
// ========================================
router.get('/profile', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;

    const { data, error } = await supabase
      .from('vendors')
      .select('*, users(email, name, phone)')
      .eq('id', vendorId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Vendor not found' });
  }
});

router.put('/profile', verifyToken, verifyVendor, async (req, res) => {
  try {
    const supabase = getSupabase();
    const vendorId = req.user.vendor_id;
    const { store_name, store_description, phone, address } = req.body;

    const { data, error } = await supabase
      .from('vendors')
      .update({ store_name, store_description, phone, address })
      .eq('id', vendorId)
      .select();

    if (error) throw error;
    res.json({ message: 'Profile updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

