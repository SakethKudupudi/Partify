import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getRedis } from '../config/redis.js';
import { getSupabase } from '../config/supabase.js';

const router = Router();

// Product browsing
router.get('/brands', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/brands/:id/models', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('phone_models')
      .select('*')
      .eq('brand_id', req.params.id)
      .eq('is_active', true);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/models/:id/components', async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get components linked to this phone model with approved vendor inventory
    const { data: modelComponents, error } = await supabase
      .from('phone_model_components')
      .select(`
        component_id, 
        components(*),
        phone_model_id
      `)
      .eq('phone_model_id', req.params.id);

    if (error) throw error;
    
    // For each component, get approved vendor inventory with pricing
    const componentsWithVendors = await Promise.all(
      modelComponents.map(async (mc) => {
        const { data: inventory } = await supabase
          .from('vendor_inventory')
          .select('*, vendors(store_name, email, is_active)')
          .eq('phone_model_id', req.params.id)
          .eq('component_id', mc.component_id)
          .eq('status', 'approved')
          .gt('quantity', 0);
        
        // Filter to only show inventory from active vendors
        const activeVendorInventory = (inventory || []).filter(item => item.vendors?.is_active !== false);
        
        return {
          ...mc.components,
          vendors: activeVendorInventory
        };
      })
    );
    
    res.json(componentsWithVendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/components/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Component not found' });
  }
});

router.get('/components/:id/vendors', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name, is_active)')
      .eq('component_id', req.params.id)
      .eq('status', 'approved');

    if (error) throw error;
    // Filter to only show inventory from active vendors
    const activeVendorInventory = (data || []).filter(item => item.vendors?.is_active !== false);
    res.json(activeVendorInventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { q, brand, category } = req.query;

    let query = supabase
      .from('components')
      .select('*')
      .eq('is_active', true);

    if (q) query = query.ilike('name', `%${q}%`);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories
router.get('/categories', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('category')
      .eq('is_active', true)
      .distinct();

    if (error) throw error;
    const categories = [...new Set(data.map(item => item.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cart (Redis)
router.get('/cart', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const cartKey = `cart:${req.user.id}`;

    const cartData = await redis.get(cartKey);
    const items = cartData ? JSON.parse(cartData) : [];

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cart/add', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const cartKey = `cart:${req.user.id}`;
    const { inventory_id, quantity } = req.body;

    // Fetch item details
    const supabase = getSupabase();
    const { data: inventory, error: invError } = await supabase
      .from('vendor_inventory')
      .select('*')
      .eq('id', inventory_id)
      .single();

    if (invError) throw invError;

    // Get current cart
    const cartData = await redis.get(cartKey);
    let items = cartData ? JSON.parse(cartData) : [];

    // Add or update item
    const existingItem = items.find(i => i.inventory_id === inventory_id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        inventory_id,
        vendor_id: inventory.vendor_id,
        quantity,
        price: inventory.proposed_price,
        name: inventory.name || 'Component'
      });
    }

    // Save to Redis (7 days expiration)
    await redis.set(cartKey, JSON.stringify(items), { EX: 86400 * 7 });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ message: 'Added to cart', items, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/cart/update/:itemId', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const cartKey = `cart:${req.user.id}`;
    const { quantity } = req.body;

    const cartData = await redis.get(cartKey);
    let items = cartData ? JSON.parse(cartData) : [];

    const item = items.find(i => i.inventory_id === req.params.itemId);
    if (item) {
      item.quantity = quantity;
    }

    await redis.set(cartKey, JSON.stringify(items), { EX: 86400 * 7 });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cart/remove/:itemId', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const cartKey = `cart:${req.user.id}`;

    const cartData = await redis.get(cartKey);
    let items = cartData ? JSON.parse(cartData) : [];

    items = items.filter(i => i.inventory_id !== req.params.itemId);

    await redis.set(cartKey, JSON.stringify(items), { EX: 86400 * 7 });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cart/clear', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const cartKey = `cart:${req.user.id}`;

    await redis.del(cartKey);
    res.json({ message: 'Cart cleared', items: [], total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders
router.post('/orders', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const redis = getRedis();

    const { shipping_address } = req.body;
    const cartKey = `cart:${req.user.id}`;

    // Get cart items
    const cartData = await redis.get(cartKey);
    const items = cartData ? JSON.parse(cartData) : [];

    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total and total items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
    const total_amount = subtotal; // For now, subtotal = total_amount (no tax/shipping added yet)

    // Generate order number
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: req.user.id,
        order_number,
        total_amount,
        subtotal,
        total_items,
        status: 'confirmed',
        shipping_address
      }])
      .select();

    if (orderError) throw orderError;

    // Create order items
    let orderItems = items.map(item => ({
      order_id: order[0].id,
      inventory_id: item.inventory_id,
      vendor_id: item.vendor_id,
      quantity: item.quantity,
      price: item.price
    }));

    // Verify and fetch vendor_id for any items that don't have it
    const itemsWithoutVendor = orderItems.filter(item => !item.vendor_id);
    if (itemsWithoutVendor.length > 0) {
      for (let i = 0; i < orderItems.length; i++) {
        if (!orderItems[i].vendor_id) {
          const { data: inv } = await supabase
            .from('vendor_inventory')
            .select('vendor_id')
            .eq('id', orderItems[i].inventory_id)
            .single();
          if (inv) {
            orderItems[i].vendor_id = inv.vendor_id;
          }
        }
      }
    }

    console.log('Inserting order items:', orderItems);
    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      throw itemsError;
    }

    console.log('Order items inserted successfully:', insertedItems);

    // Clear cart
    await redis.del(cartKey);

    res.status(201).json({
      message: 'Order created',
      order_id: order[0].id,
      order_number,
      total_amount,
      items_count: insertedItems?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (orderError) throw orderError;

    console.log('Order found:', orderData.id);

    // Fetch order items separately with vendor_inventory and components
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*, vendor_inventory(*, components(*))')
      .eq('order_id', req.params.id);

    console.log(`Order items fetched: ${itemsData?.length || 0} items`);
    
    if (itemsError) throw itemsError;

    // Combine order data with items
    const orderWithItems = {
      ...orderData,
      order_items: itemsData || []
    };

    console.log('Returning order with items:', JSON.stringify(orderWithItems, null, 2));
    res.json(orderWithItems);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(404).json({ error: 'Order not found', details: error.message });
  }
});

router.post('/orders/:id/review', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { rating, comment } = req.body;

    // Create review (optional: add reviews table)
    res.json({ message: 'Review submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ADDITIONAL PRODUCT BROWSING ROUTES
// ========================================
router.get('/brands/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Get model count
    const { data: models } = await supabase
      .from('phone_models')
      .select('id')
      .eq('brand_id', req.params.id)
      .eq('is_active', true);

    res.json({ ...data, model_count: models?.length || 0 });
  } catch (error) {
    res.status(404).json({ error: 'Brand not found' });
  }
});

router.get('/models/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('phone_models')
      .select('*, brands(name)')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Get available components count - only from active vendors
    const { data: components } = await supabase
      .from('vendor_inventory')
      .select('component_id, vendors(is_active)')
      .eq('phone_model_id', req.params.id)
      .eq('status', 'approved');

    // Filter to only active vendors
    const activeComponents = (components || []).filter(c => c.vendors?.is_active !== false);
    const uniqueComponents = new Set(activeComponents.map(c => c.component_id));

    res.json({ ...data, available_components: uniqueComponents.size });
  } catch (error) {
    res.status(404).json({ error: 'Model not found' });
  }
});

router.get('/categories/:categoryName', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('category', req.params.categoryName)
      .eq('is_active', true);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// MULTI-STEP CHECKOUT ROUTES
// ========================================
router.post('/checkout/shipping', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const checkoutKey = `checkout:${req.user.id}`;
    const { shipping_address, shipping_method } = req.body;

    // Store shipping info in Redis temporarily
    const checkoutData = {
      shipping_address,
      shipping_method,
      step: 'payment'
    };

    await redis.set(checkoutKey, JSON.stringify(checkoutData), { EX: 3600 }); // 1 hour

    res.json({ message: 'Shipping info saved', next_step: 'payment' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/checkout/payment', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const checkoutKey = `checkout:${req.user.id}`;
    const { payment_method, payment_details } = req.body;

    // Get existing checkout data
    const checkoutDataStr = await redis.get(checkoutKey);
    if (!checkoutDataStr) {
      return res.status(400).json({ error: 'Checkout session expired' });
    }

    const checkoutData = JSON.parse(checkoutDataStr);
    checkoutData.payment_method = payment_method;
    checkoutData.payment_details = payment_details;
    checkoutData.step = 'review';

    await redis.set(checkoutKey, JSON.stringify(checkoutData), { EX: 3600 });

    res.json({ message: 'Payment info saved', next_step: 'review' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/checkout/review', verifyToken, async (req, res) => {
  try {
    const redis = getRedis();
    const checkoutKey = `checkout:${req.user.id}`;
    const cartKey = `cart:${req.user.id}`;

    // Get checkout data
    const checkoutDataStr = await redis.get(checkoutKey);
    if (!checkoutDataStr) {
      return res.status(400).json({ error: 'Checkout session expired' });
    }

    // Get cart items
    const cartDataStr = await redis.get(cartKey);
    const items = cartDataStr ? JSON.parse(cartDataStr) : [];

    const checkoutData = JSON.parse(checkoutDataStr);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      ...checkoutData,
      items,
      subtotal: total,
      shipping_fee: 5.00,
      tax: total * 0.08,
      total: total + 5.00 + (total * 0.08)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/checkout/confirm', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const redis = getRedis();
    const checkoutKey = `checkout:${req.user.id}`;
    const cartKey = `cart:${req.user.id}`;

    // Get checkout and cart data
    const checkoutDataStr = await redis.get(checkoutKey);
    const cartDataStr = await redis.get(cartKey);

    if (!checkoutDataStr || !cartDataStr) {
      return res.status(400).json({ error: 'Checkout session expired' });
    }

    const checkoutData = JSON.parse(checkoutDataStr);
    const items = JSON.parse(cartDataStr);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = total + 5.00 + (total * 0.08);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: req.user.id,
        total_amount: finalTotal,
        status: 'confirmed',
        shipping_address: checkoutData.shipping_address,
        payment_method: checkoutData.payment_method
      }])
      .select();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order[0].id,
      vendor_inventory_id: item.inventory_id,
      quantity: item.quantity,
      price: item.price
    }));

    await supabase.from('order_items').insert(orderItems);

    // Clear cart and checkout
    await redis.del(cartKey);
    await redis.del(checkoutKey);

    res.status(201).json({
      message: 'Order confirmed',
      order_id: order[0].id,
      total: finalTotal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ORDER TRACKING & MANAGEMENT ROUTES
// ========================================
router.get('/orders/:id/track', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, created_at, updated_at, shipping_address')
      .eq('id', req.params.id)
      .eq('customer_id', req.user.id)
      .single();

    if (error) throw error;

    // Tracking timeline
    const timeline = [
      { status: 'confirmed', label: 'Order Confirmed', completed: true },
      { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(data.status) },
      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(data.status) },
      { status: 'delivered', label: 'Delivered', completed: data.status === 'delivered' }
    ];

    res.json({ ...data, timeline });
  } catch (error) {
    res.status(404).json({ error: 'Order not found' });
  }
});

router.get('/orders/:id/invoice', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(*, components(name), vendors(store_name)))')
      .eq('id', req.params.id)
      .eq('customer_id', req.user.id)
      .single();

    if (error) throw error;

    const invoice = {
      order_id: data.id,
      date: data.created_at,
      items: data.order_items,
      subtotal: data.total_amount,
      shipping: 5.00,
      tax: data.total_amount * 0.08,
      total: data.total_amount
    };

    res.json(invoice);
  } catch (error) {
    res.status(404).json({ error: 'Order not found' });
  }
});

router.post('/orders/:id/return', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { reason, items } = req.body;

    // Verify order ownership
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id, status')
      .eq('id', req.params.id)
      .single();

    if (!order || order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only return delivered orders' });
    }

    // Create return request (you might want a returns table)
    res.json({ message: 'Return request submitted', order_id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orders/:id/cancel', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();

    // Verify order ownership and status
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id, status')
      .eq('id', req.params.id)
      .single();

    if (!order || order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!['confirmed', 'pending'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order in current status' });
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ACCOUNT MANAGEMENT ROUTES
// ========================================
router.get('/account/profile', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, phone, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

router.put('/account/profile', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, phone } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, phone })
      .eq('id', req.user.id)
      .select();

    if (error) throw error;
    res.json({ message: 'Profile updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/account/addresses', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', req.user.id);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/account/addresses', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { address_line1, address_line2, city, state, zip_code, country, is_default } = req.body;

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert([{
        customer_id: req.user.id,
        address_line1,
        address_line2,
        city,
        state,
        zip_code,
        country,
        is_default
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Address added', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/account/addresses/:id', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { address_line1, address_line2, city, state, zip_code, country, is_default } = req.body;

    // Verify ownership
    const { data: address } = await supabase
      .from('customer_addresses')
      .select('customer_id')
      .eq('id', req.params.id)
      .single();

    if (!address || address.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .update({ address_line1, address_line2, city, state, zip_code, country, is_default })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json({ message: 'Address updated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/account/addresses/:id', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();

    // Verify ownership
    const { data: address } = await supabase
      .from('customer_addresses')
      .select('customer_id')
      .eq('id', req.params.id)
      .single();

    if (!address || address.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/account/payment-methods', verifyToken, async (req, res) => {
  try {
    // This would typically integrate with a payment provider
    res.json({ message: 'Payment methods endpoint - integrate with Stripe/PayPal' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/account/wishlist', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, components(*)')
      .eq('customer_id', req.user.id);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/account/wishlist', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { component_id } = req.body;

    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ customer_id: req.user.id, component_id }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Added to wishlist', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/account/wishlist/:componentId', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('customer_id', req.user.id)
      .eq('component_id', req.params.componentId);

    if (error) throw error;
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// SUPPORT & INFORMATION ROUTES
// ========================================
router.post('/support/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    // Implement email sending or ticket creation
    res.json({ message: 'Support request submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/support/faq', async (req, res) => {
  try {
    const faqs = [
      { question: 'How do I track my order?', answer: 'You can track your order from your account dashboard.' },
      { question: 'What is your return policy?', answer: 'We accept returns within 30 days of delivery.' },
      { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days.' }
    ];
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/support/track-order/:orderId', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, created_at, updated_at')
      .eq('id', req.params.orderId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Order not found' });
  }
});

export default router;

