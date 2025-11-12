import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { getSupabase } from '../config/supabase.js';
import { uploadToAzure } from '../config/azure.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
      return;
    }
    cb(null, true);
  }
});

// Image upload endpoint
router.post('/upload-image', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const blobName = `${uuidv4()}.${fileExtension}`;
    const containerName = 'product-images'; // You can make this dynamic based on type

    // Upload to Azure Blob Storage
    const imageUrl = await uploadToAzure(containerName, blobName, req.file.buffer);

    res.json({ 
      success: true, 
      imageUrl,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Brand routes
router.get('/brands', verifyToken, verifyAdmin, async (req, res) => {
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

router.post('/brands', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, description, image_url } = req.body;

    const { data, error } = await supabase
      .from('brands')
      .insert([{ name, description, image_url, is_active: true }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/brands/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Brand not found' });
  }
});

router.put('/brands/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, description, image_url } = req.body;

    const { data, error } = await supabase
      .from('brands')
      .update({ name, description, image_url })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/brands/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('brands')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Brand deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Phone Model routes
router.get('/models', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('phone_models')
      .select(`
        *,
        brands(name),
        phone_model_components(
          components(name)
        )
      `)
      .eq('is_active', true);

    if (error) throw error;

    // Transform the data to include available_components array
    const transformedData = data.map(model => ({
      ...model,
      available_components: model.phone_model_components?.map(pmc => pmc.components?.name).filter(Boolean) || []
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/models', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { brand_id, name, model_number, specification, image_url, release_year, specifications, available_components } = req.body;

    // Create the phone model
    const { data: modelData, error: modelError } = await supabase
      .from('phone_models')
      .insert([{ 
        brand_id, 
        name, 
        model_number, 
        specification: specifications || specification, 
        image_url, 
        release_date: release_year ? `${release_year}-01-01` : null,
        is_active: true 
      }])
      .select();

    if (modelError) throw modelError;

    const newModel = modelData[0];

    // Handle components if provided
    if (available_components && available_components.length > 0) {
      // Get or create components
      for (const componentName of available_components) {
        // Check if component exists
        const { data: existingComponent } = await supabase
          .from('components')
          .select('id')
          .eq('name', componentName)
          .single();

        let componentId;
        
        if (existingComponent) {
          componentId = existingComponent.id;
        } else {
          // Create new component
          const { data: newComponent, error: componentError } = await supabase
            .from('components')
            .insert([{ 
              name: componentName,
              category: 'Phone Parts',
              is_active: true 
            }])
            .select();
          
          if (componentError) {
            console.error('Error creating component:', componentError);
            continue;
          }
          componentId = newComponent[0].id;
        }

        // Link component to model
        await supabase
          .from('phone_model_components')
          .insert([{ 
            phone_model_id: newModel.id, 
            component_id: componentId,
            is_compatible: true 
          }]);
      }
    }

    res.status(201).json(newModel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/models/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('phone_models')
      .select('*, phone_model_components(*, components(*))')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Model not found' });
  }
});

router.put('/models/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, model_number, specification, image_url, release_year, specifications, available_components } = req.body;

    console.log('PUT /models/:id - Request body:', req.body);
    console.log('Release year received:', release_year);
    console.log('Release date to be saved:', release_year ? `${release_year}-01-01` : null);

    // Update the phone model
    const { data, error } = await supabase
      .from('phone_models')
      .update({ 
        name, 
        model_number, 
        specification: specifications || specification, 
        image_url,
        release_date: release_year ? `${release_year}-01-01` : null
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;

    console.log('Updated model data:', data);

    // Handle components update if provided
    if (available_components) {
      // Delete existing component associations
      await supabase
        .from('phone_model_components')
        .delete()
        .eq('phone_model_id', req.params.id);

      // Add new component associations
      for (const componentName of available_components) {
        // Check if component exists
        const { data: existingComponent } = await supabase
          .from('components')
          .select('id')
          .eq('name', componentName)
          .single();

        let componentId;
        
        if (existingComponent) {
          componentId = existingComponent.id;
        } else {
          // Create new component
          const { data: newComponent } = await supabase
            .from('components')
            .insert([{ 
              name: componentName,
              category: 'Phone Parts',
              is_active: true 
            }])
            .select();
          
          if (newComponent) {
            componentId = newComponent[0].id;
          }
        }

        if (componentId) {
          // Link component to model
          await supabase
            .from('phone_model_components')
            .insert([{ 
              phone_model_id: req.params.id, 
              component_id: componentId,
              is_compatible: true 
            }]);
        }
      }
    }

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/models/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('phone_models')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Model deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Component routes
router.get('/components', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/components', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { category, name, description, image_url } = req.body;

    const { data, error } = await supabase
      .from('components')
      .insert([{ category, name, description, image_url, is_active: true }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/components/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Component not found' });
  }
});

router.put('/components/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { category, name, description, image_url } = req.body;

    const { data, error } = await supabase
      .from('components')
      .update({ category, name, description, image_url })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/components/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('components')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Component deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendor management
router.get('/vendors', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendors')
      .select('*, users(email, name)');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendors')
      .select('*, users(email, name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Vendor not found' });
  }
});

// Sales & Analytics
router.get('/sales/overview', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { data: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount');

    const totalRevenue = totalOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    res.json({
      total_revenue: totalRevenue,
      total_orders: totalOrders?.length || 0,
      total_vendors: 0,
      total_customers: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/reports', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { start_date, end_date } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(proposed_price))');

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/analytics/trends', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount');

    if (error) throw error;

    // Process data to show trends over time
    const trends = data.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const existing = acc.find(t => t.date === date);
      if (existing) {
        existing.amount += order.total_amount;
        existing.count += 1;
      } else {
        acc.push({ date, amount: order.total_amount, count: 1 });
      }
      return acc;
    }, []);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendor requests
router.get('/vendors/requests', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name), phone_models(name), components(name)')
      .eq('status', 'pending_approval');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/vendors/requests/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('vendor_inventory')
      .update({ status: 'approved' })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Request approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/vendors/requests/:id/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { reason } = req.body;

    const { error } = await supabase
      .from('vendor_inventory')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ADDITIONAL BRAND ROUTES
// ========================================
router.get('/brands/:id/models', verifyToken, verifyAdmin, async (req, res) => {
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

// ========================================
// ADDITIONAL MODEL ROUTES
// ========================================
router.get('/models/:id/components', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('phone_model_components')
      .select('*, components(*)')
      .eq('phone_model_id', req.params.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/models/bulk-upload', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { models } = req.body; // Array of model objects

    const { data, error } = await supabase
      .from('phone_models')
      .insert(models)
      .select();

    if (error) throw error;
    res.status(201).json({ message: `${data.length} models uploaded`, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ADDITIONAL COMPONENT ROUTES
// ========================================
router.get('/components/:id/inventory', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name), phone_models(name)')
      .eq('component_id', req.params.id)
      .eq('status', 'approved');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/components/categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;
    
    // Get unique categories
    const categories = [...new Set(data.map(c => c.category))].filter(Boolean);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/components/bulk-upload', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { components } = req.body; // Array of component objects

    const { data, error } = await supabase
      .from('components')
      .insert(components)
      .select();

    if (error) throw error;
    res.status(201).json({ message: `${data.length} components uploaded`, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ADDITIONAL VENDOR ROUTES
// ========================================
router.get('/vendors/:id/inventory', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, phone_models(name), components(name, category)')
      .eq('vendor_id', req.params.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/:id/sales', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(created_at, status), vendor_inventory(vendor_id, proposed_price)')
      .eq('vendor_inventory.vendor_id', req.params.id);

    if (error) throw error;
    
    const totalSales = data.reduce((sum, item) => {
      return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
    }, 0);

    res.json({ sales: data, total_sales: totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/vendors/:id/suspend', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { is_suspended, reason } = req.body;

    const { data, error } = await supabase
      .from('vendors')
      .update({ is_suspended, suspension_reason: reason })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json({ message: is_suspended ? 'Vendor suspended' : 'Vendor activated', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/requests/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name), phone_models(name), components(name)')
      .eq('status', 'pending_approval');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/requests/approved', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name), phone_models(name), components(name)')
      .eq('status', 'approved');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/requests/rejected', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name), phone_models(name), components(name), rejection_reason')
      .eq('status', 'rejected');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/requests/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_inventory')
      .select('*, vendors(store_name, users(email)), phone_models(name), components(name, category)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Request not found' });
  }
});

router.get('/vendors/performance', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get all vendors with their sales data
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, store_name, created_at');

    if (error) throw error;

    const performance = await Promise.all(vendors.map(async (vendor) => {
      const { data: items } = await supabase
        .from('order_items')
        .select('quantity, vendor_inventory(vendor_id, proposed_price)')
        .eq('vendor_inventory.vendor_id', vendor.id);

      const totalSales = items?.reduce((sum, item) => {
        return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
      }, 0) || 0;

      return {
        ...vendor,
        total_sales: totalSales,
        total_orders: items?.length || 0
      };
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// COMPREHENSIVE SALES & ANALYTICS ROUTES
// ========================================
router.get('/sales/reports/daily', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(proposed_price, components(name)))')
      .gte('created_at', today);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/reports/weekly', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(proposed_price, components(name)))')
      .gte('created_at', weekAgo);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/reports/monthly', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(proposed_price, components(name)))')
      .gte('created_at', monthAgo);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/reports/custom', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { start_date, end_date } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, vendor_inventory(proposed_price, components(name)))');

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/analytics/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(component_id, components(name, category))');

    if (error) throw error;

    // Aggregate by component
    const productSales = data.reduce((acc, item) => {
      const componentId = item.vendor_inventory?.component_id;
      const componentName = item.vendor_inventory?.components?.name;
      
      if (componentId) {
        const existing = acc.find(p => p.component_id === componentId);
        if (existing) {
          existing.total_quantity += item.quantity;
        } else {
          acc.push({
            component_id: componentId,
            component_name: componentName,
            category: item.vendor_inventory?.components?.category,
            total_quantity: item.quantity
          });
        }
      }
      return acc;
    }, []);

    // Sort by total quantity
    productSales.sort((a, b) => b.total_quantity - a.total_quantity);

    res.json(productSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/analytics/brands', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(phone_model_id, phone_models(brand_id, brands(name)), proposed_price)');

    if (error) throw error;

    // Aggregate by brand
    const brandSales = data.reduce((acc, item) => {
      const brandId = item.vendor_inventory?.phone_models?.brand_id;
      const brandName = item.vendor_inventory?.phone_models?.brands?.name;
      const amount = item.quantity * (item.vendor_inventory?.proposed_price || 0);
      
      if (brandId) {
        const existing = acc.find(b => b.brand_id === brandId);
        if (existing) {
          existing.total_quantity += item.quantity;
          existing.total_amount += amount;
        } else {
          acc.push({
            brand_id: brandId,
            brand_name: brandName,
            total_quantity: item.quantity,
            total_amount: amount
          });
        }
      }
      return acc;
    }, []);

    brandSales.sort((a, b) => b.total_amount - a.total_amount);

    res.json(brandSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/analytics/vendors', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, vendors(store_name), proposed_price)');

    if (error) throw error;

    // Aggregate by vendor
    const vendorSales = data.reduce((acc, item) => {
      const vendorId = item.vendor_inventory?.vendor_id;
      const vendorName = item.vendor_inventory?.vendors?.store_name;
      const amount = item.quantity * (item.vendor_inventory?.proposed_price || 0);
      
      if (vendorId) {
        const existing = acc.find(v => v.vendor_id === vendorId);
        if (existing) {
          existing.total_quantity += item.quantity;
          existing.total_amount += amount;
        } else {
          acc.push({
            vendor_id: vendorId,
            vendor_name: vendorName,
            total_quantity: item.quantity,
            total_amount: amount
          });
        }
      }
      return acc;
    }, []);

    vendorSales.sort((a, b) => b.total_amount - a.total_amount);

    res.json(vendorSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/revenue', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, created_at, status');

    if (error) throw error;

    const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0);
    const completedRevenue = data
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total_amount, 0);

    res.json({
      total_revenue: totalRevenue,
      completed_revenue: completedRevenue,
      pending_revenue: totalRevenue - completedRevenue,
      total_orders: data.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales/commissions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const COMMISSION_RATE = 0.10; // 10% platform fee

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, vendors(store_name), proposed_price)');

    if (error) throw error;

    // Calculate commissions by vendor
    const commissions = data.reduce((acc, item) => {
      const vendorId = item.vendor_inventory?.vendor_id;
      const vendorName = item.vendor_inventory?.vendors?.store_name;
      const saleAmount = item.quantity * (item.vendor_inventory?.proposed_price || 0);
      const commission = saleAmount * COMMISSION_RATE;
      
      if (vendorId) {
        const existing = acc.find(v => v.vendor_id === vendorId);
        if (existing) {
          existing.total_sales += saleAmount;
          existing.commission += commission;
        } else {
          acc.push({
            vendor_id: vendorId,
            vendor_name: vendorName,
            total_sales: saleAmount,
            commission: commission
          });
        }
      }
      return acc;
    }, []);

    res.json(commissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sales/commissions/calculate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { vendor_id, start_date, end_date } = req.body;
    const supabase = getSupabase();
    const COMMISSION_RATE = 0.10;

    let query = supabase
      .from('order_items')
      .select('quantity, vendor_inventory(vendor_id, proposed_price), orders(created_at)');

    if (vendor_id) {
      query = query.eq('vendor_inventory.vendor_id', vendor_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter by date and calculate
    const filtered = data.filter(item => {
      const orderDate = item.orders?.created_at;
      if (!orderDate) return false;
      if (start_date && orderDate < start_date) return false;
      if (end_date && orderDate > end_date) return false;
      return true;
    });

    const totalSales = filtered.reduce((sum, item) => {
      return sum + (item.quantity * (item.vendor_inventory?.proposed_price || 0));
    }, 0);

    const commission = totalSales * COMMISSION_RATE;

    res.json({
      period: { start_date, end_date },
      total_sales: totalSales,
      commission_rate: COMMISSION_RATE,
      commission_amount: commission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ORDER MANAGEMENT ROUTES
// ========================================
router.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(email, name), order_items(*, vendor_inventory(components(name)))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(email, name, phone), order_items(*, vendor_inventory(*, components(name), vendors(store_name)))')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Order not found' });
  }
});

router.get('/orders/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(email, name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/completed', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(email, name)')
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/cancelled', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(email, name)')
      .eq('status', 'cancelled')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/orders/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// SETTINGS ROUTES
// ========================================
router.get('/settings', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Return platform settings (could be from a settings table or config)
    res.json({
      platform_commission: 0.10,
      shipping_fee: 5.00,
      tax_rate: 0.08,
      currency: 'USD',
      notifications_enabled: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Update settings (implement based on your settings storage)
    const settings = req.body;
    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Components Management Endpoints
router.get('/components', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/components', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, category, description, specifications } = req.body;

    const { data, error } = await supabase
      .from('components')
      .insert([{
        name,
        category: category || 'Phone Parts',
        description,
        specifications,
        is_active: true
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/components/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, category, description, specifications } = req.body;

    const { data, error } = await supabase
      .from('components')
      .update({
        name,
        category,
        description,
        specifications
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/components/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // First delete associations in phone_model_components
    await supabase
      .from('phone_model_components')
      .delete()
      .eq('component_id', req.params.id);

    // Then delete the component
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

