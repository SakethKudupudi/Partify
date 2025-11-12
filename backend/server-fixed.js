import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { initializeSupabase } from './config/supabase.js';
import { initializeRedis } from './config/redis.js';
import { initializeAzure } from './config/azure.js';

// Import routes
import authRoutes from './routes/auth.js';
import brandRoutes from './routes/brands.js';
import phoneModelRoutes from './routes/phoneModels.js';
import componentRoutes from './routes/components.js';
import vendorInventoryRoutes from './routes/vendorInventory.js';
import vendorRequestRoutes from './routes/vendorRequests.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Initialize services with error handling
console.log('🚀 Starting Partify Backend...\n');

try {
  console.log('📡 Initializing Supabase...');
  await initializeSupabase();
  console.log('✅ Supabase connected\n');
} catch (error) {
  console.error('❌ Supabase failed:', error.message);
  console.error('⚠️  Make sure:');
  console.error('   1. .env.local has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   2. Database schema is executed in Supabase SQL Editor');
  console.error('   3. Check your internet connection\n');
  process.exit(1);
}

try {
  console.log('🔴 Initializing Redis...');
  await initializeRedis();
  console.log('✅ Redis ready (or using in-memory cache)\n');
} catch (error) {
  console.warn('⚠️  Redis not available - using in-memory cache\n');
}

try {
  console.log('☁️  Initializing Azure Storage...');
  await initializeAzure();
  console.log('✅ Azure Storage ready\n');
} catch (error) {
  console.warn('⚠️  Azure Storage not configured\n');
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      supabase: '✅ Connected',
      redis: 'Ready',
      azure: 'Optional'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/phone-models', phoneModelRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/vendor-inventory', vendorInventoryRoutes);
app.use('/api/vendor-requests', vendorRequestRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     ✅ Partify Backend Running Successfully      ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
  console.log('📚 Available endpoints:');
  console.log('   POST   /api/auth/register      - Register new user');
  console.log('   POST   /api/auth/login         - Login user');
  console.log('   GET    /api/auth/me            - Get current user');
  console.log('   GET    /api/brands             - List all brands');
  console.log('   POST   /api/cart/add           - Add to cart');
  console.log('   GET    /api/orders             - Get orders\n');
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

