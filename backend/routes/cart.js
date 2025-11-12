import { Router } from 'express';
import { getRedis } from '../config/redis.js';
import { getSupabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
  const redis = getRedis();
  const { user } = req;
  const supabase = getSupabase();

  const cartKey = `cart:${user.id}`;
  const cartData = await redis.get(cartKey);

  if (!cartData) {
    return res.json({ items: [], total: 0 });
  }

  const items = JSON.parse(cartData);

  // Fetch current prices from vendor_inventory
  const itemIds = items.map(item => item.inventory_id);
  const { data: inventoryData } = await supabase
    .from('vendor_inventory')
    .select('id, proposed_price')
    .in('id', itemIds);

  const priceMap = {};
  inventoryData?.forEach(item => {
    priceMap[item.id] = item.proposed_price;
  });

  // Update prices if changed
  let total = 0;
  items.forEach(item => {
    const currentPrice = priceMap[item.inventory_id] || item.price;
    item.price = currentPrice;
    total += currentPrice * item.quantity;
  });

  res.json({ items, total });
});

// Add to cart
router.post('/add', verifyToken, async (req, res) => {
  const redis = getRedis();
  const { user } = req;
  const { inventory_id, quantity } = req.body;

  if (!inventory_id || quantity < 1) {
    return res.status(400).json({ error: 'Invalid inventory_id or quantity' });
  }

  const supabase = getSupabase();
  const { data: inventoryItem } = await supabase
    .from('vendor_inventory')
    .select('proposed_price, quantity')
    .eq('id', inventory_id)
    .eq('status', 'approved')
    .single();

  if (!inventoryItem) {
    return res.status(404).json({ error: 'Item not available' });
  }

  if (inventoryItem.quantity < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  const cartKey = `cart:${user.id}`;
  let cartData = await redis.get(cartKey);
  let items = cartData ? JSON.parse(cartData) : [];

  // Check if item already in cart
  const existingIndex = items.findIndex(item => item.inventory_id === inventory_id);

  if (existingIndex >= 0) {
    items[existingIndex].quantity += quantity;
  } else {
    items.push({
      id: uuidv4(),
      inventory_id,
      quantity,
      price: inventoryItem.proposed_price,
      added_at: new Date().toISOString()
    });
  }

  await redis.set(cartKey, JSON.stringify(items), { EX: 86400 * 7 }); // 7 days
  res.json({ message: 'Item added to cart', items });
});

// Update cart item
router.put('/items/:cartItemId', verifyToken, async (req, res) => {
  const redis = getRedis();
  const { user } = req;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const cartKey = `cart:${user.id}`;
  const cartData = await redis.get(cartKey);
  let items = cartData ? JSON.parse(cartData) : [];

  const itemIndex = items.findIndex(item => item.id === cartItemId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  if (quantity === 0) {
    items.splice(itemIndex, 1);
  } else {
    items[itemIndex].quantity = quantity;
  }

  await redis.set(cartKey, JSON.stringify(items), { EX: 86400 * 7 });
  res.json({ items });
});

// Remove from cart
router.delete('/items/:cartItemId', verifyToken, async (req, res) => {
  const redis = getRedis();
  const { user } = req;
  const { cartItemId } = req.params;

  const cartKey = `cart:${user.id}`;
  const cartData = await redis.get(cartKey);
  let items = cartData ? JSON.parse(cartData) : [];

  items = items.filter(item => item.id !== cartItemId);

  if (items.length === 0) {
    await redis.del(cartKey);
  } else {
    await redis.set(cartKey, JSON.stringify(items), { EX: 86400 * 7 });
  }

  res.json({ items });
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  const redis = getRedis();
  const { user } = req;

  const cartKey = `cart:${user.id}`;
  await redis.del(cartKey);

  res.json({ message: 'Cart cleared' });
});

export default router;

