# Development Guide

## Project Architecture

### Frontend Architecture

```
unified-portal/
├── src/
│   ├── pages/
│   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── orders/
│   │   │   ├── account/
│   │   │   ├── brands/
│   │   │   ├── components/
│   │   │   ├── inventory/
│   │   │   └── requests/
│   │   ├── customer/        # Customer portal pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── Brands.jsx
│   │   │   ├── PhoneModels.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── orders/
│   │   │   └── brands/
│   │   ├── vendor/          # Vendor dashboard pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   └── AddInventory.jsx
│   │   └── Login.jsx
│   ├── components/          # Shared components
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   └── Footer.jsx
│   ├── store/              # State management
│   │   └── cartStore.js
│   ├── styles/             # Global styles
│   └── main.jsx
```

### Backend Architecture

```
backend/
├── routes/
│   ├── adminApi.js         # Admin endpoints
│   ├── vendorApi.js        # Vendor endpoints
│   ├── customerApi.js      # Customer endpoints
│   ├── auth.js             # Authentication
│   └── ...
├── middleware/
│   └── auth.js             # JWT verification
├── config/
│   ├── supabase.js         # Supabase client
│   ├── redis.js            # Redis client
│   └── azure.js            # Azure storage
└── server.js               # Express app setup
```

## API Endpoints Overview

### Admin Routes (`/api/admin/*`)
- `GET /vendors` - List all vendors
- `GET /vendors/requests` - Pending vendor requests
- `PUT /vendors/:id/approve` - Approve vendor request
- `GET /orders` - View all orders
- `PUT /orders/:id` - Update order status

### Customer Routes (`/api/customer/*`)
- `GET /models` - List phone models
- `GET /models/:id/components` - Get components for a model
- `POST /cart` - Add to cart
- `GET /cart` - View cart
- `POST /orders` - Place order
- `GET /orders` - View customer's orders

### Vendor Routes (`/api/vendor/*`)
- `GET /inventory` - List vendor's inventory
- `POST /inventory` - Add inventory
- `GET /requests` - View inventory requests
- `PUT /inventory/:id` - Update inventory

## Database Schema

### Core Tables
- **users** - User accounts with roles
- **vendors** - Vendor profiles
- **brands** - Phone brands
- **phone_models** - Phone models by brand
- **components** - Phone components
- **vendor_inventory** - Vendor listings with approval status
- **orders** - Customer orders
- **order_items** - Items in each order

### Key Relationships
```
users (customers/vendors/admins)
  ├── vendors (1-to-1 with user)
  ├── orders (1-to-many)
  └── vendor_inventory (1-to-many via vendor_id)

orders
  └── order_items (1-to-many)
      └── vendor_inventory (many-to-1)

phone_models
  ├── brand (many-to-1)
  ├── phone_model_components (junction)
  └── vendor_inventory (1-to-many)

components
  ├── phone_model_components (junction)
  └── vendor_inventory (1-to-many)
```

## Important Features Explained

### Vendor Approval Workflow
1. Vendor adds components to inventory (status: `pending_approval`)
2. Admin reviews in dashboard
3. Admin approves (status: `approved`) or rejects (status: `rejected`)
4. Approved items visible to customers
5. Customers can purchase from approved vendors only

### Vendor Status Filtering
- When a vendor is deactivated (`is_active = false`):
  - Their requests hidden from admin dashboard
  - Their inventory hidden from customers
  - Existing orders preserved for historical records

### Shopping Cart Management
- Cart stored in Redis for performance
- Structure: `cart:{user_id}` → JSON array of items
- Items include: `inventory_id`, `quantity`, `price`, `vendor_id`

### Order Processing
- Order creation: Retrieves cart from Redis
- Creates order with total_items and subtotal
- Creates individual order_items for each product
- Clears Redis cart after successful order

## Development Tips

### Adding a New Feature

1. **Backend First**
   - Design database schema changes (if needed)
   - Create API endpoint
   - Add authentication/authorization
   - Test with Postman or curl

2. **Frontend Implementation**
   - Create components
   - Integrate with API
   - Handle loading/error states
   - Add user feedback (toasts, alerts)

### Testing Locally

```bash
# Backend
curl -X GET http://localhost:8080/api/admin/vendors \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check Redis
redis-cli
> GET cart:user_id

# Monitor logs
tail -f /tmp/backend-server.log
```

### Common Debugging

**Issue: Token expired**
- Solution: Re-login to get new token

**Issue: Cart items not persisting**
- Check Redis connection
- Verify cart key format

**Issue: Vendor inventory not showing**
- Verify `is_active = true` in vendors table
- Check `status = 'approved'` in vendor_inventory
- Check `gt('quantity', 0)`

## Performance Considerations

1. **Database Queries**
   - Use `.select()` to limit columns
   - Leverage indexes on frequently queried fields
   - Avoid N+1 queries with proper joins

2. **Caching**
   - Cache phone models and brands
   - Cache component lists
   - Cache vendor store names

3. **Frontend**
   - Code split pages with React.lazy()
   - Memoize expensive components
   - Implement virtual scrolling for long lists

## Deployment Checklist

- [ ] Update version in package.json
- [ ] Run all tests
- [ ] Build frontend: `npm run build`
- [ ] Test production build locally
- [ ] Create database migrations
- [ ] Update environment variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Monitor error logs

## Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Supabase Docs](https://supabase.com/docs)
- [Redis Documentation](https://redis.io/docs)
- [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/)
