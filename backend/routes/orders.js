import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { getRedis } from '../config/redis.js';
import { verifyToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create order from cart
router.post('/', verifyToken, async (req, res) => {
  const supabase = getSupabase();
  const redis = getRedis();
  const { user } = req;
  const { shipping_address } = req.body;

  if (!shipping_address) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  // Get cart from Redis
  const cartKey = `cart:${user.id}`;
  const cartData = await redis.get(cartKey);

  if (!cartData) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const cartItems = JSON.parse(cartData);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // Create order
    const orderId = uuidv4();
    let totalAmount = 0;
    const orderItems = [];

    // Verify inventory and create order items
    for (const item of cartItems) {
      const { data: inventory } = await supabase
        .from('vendor_inventory')
        .select('vendor_id, quantity, proposed_price')
        .eq('id', item.inventory_id)
        .eq('status', 'approved')
        .single();

      if (!inventory) {
        throw new Error(`Item ${item.inventory_id} not found or not available`);
      }

      if (inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ${item.inventory_id}`);
      }

      totalAmount += inventory.proposed_price * item.quantity;

      orderItems.push({
        id: uuidv4(),
        order_id: orderId,
        inventory_id: item.inventory_id,
        vendor_id: inventory.vendor_id,
        quantity: item.quantity,
        price: inventory.proposed_price,
        created_at: new Date().toISOString()
      });
    }

    // Insert order
    const { error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        customer_id: user.id,
        total_amount: totalAmount,
        shipping_address,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }]);

    if (orderError) throw orderError;

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update vendor inventory quantities
    for (const item of cartItems) {
      const { data: inventory } = await supabase
        .from('vendor_inventory')
        .select('quantity')
        .eq('id', item.inventory_id)
        .single();

      await supabase
        .from('vendor_inventory')
        .update({ quantity: inventory.quantity - item.quantity })
        .eq('id', item.inventory_id);
    }

    // Clear cart
    await redis.del(cartKey);

    res.status(201).json({
      message: 'Order created successfully',
      order_id: orderId,
      total_amount: totalAmount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user orders
router.get('/', verifyToken, async (req, res) => {
  const supabase = getSupabase();
  const { user } = req;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        vendor_inventory(
          phone_models(name),
          components(name)
        )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

// Get order details
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  const { user } = req;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        vendor_inventory(
          phone_models(name),
          components(name)
        )
      )
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .single();

  if (error) throw error;
  if (!data) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(data);
});

export default router;

