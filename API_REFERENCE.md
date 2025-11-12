# Partify API Quick Reference

## Base URL
- **Development**: `http://localhost:8080`
- **Production**: TBD

---

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Admin API Endpoints

### Brands
```
GET    /api/admin/brands                    - List all brands
POST   /api/admin/brands                    - Create brand
GET    /api/admin/brands/:id                - Get brand details
PUT    /api/admin/brands/:id                - Update brand
DELETE /api/admin/brands/:id                - Deactivate brand
GET    /api/admin/brands/:id/models         - Get brand models
```

### Models
```
GET    /api/admin/models                    - List all models
POST   /api/admin/models                    - Create model
GET    /api/admin/models/:id                - Get model details
PUT    /api/admin/models/:id                - Update model
DELETE /api/admin/models/:id                - Deactivate model
GET    /api/admin/models/:id/components     - Get model components
POST   /api/admin/models/bulk-upload        - Bulk upload models
```

### Components
```
GET    /api/admin/components                - List all components
POST   /api/admin/components                - Create component
GET    /api/admin/components/:id            - Get component details
PUT    /api/admin/components/:id            - Update component
DELETE /api/admin/components/:id            - Deactivate component
GET    /api/admin/components/:id/inventory  - Get inventory levels
GET    /api/admin/components/categories     - Get all categories
POST   /api/admin/components/bulk-upload    - Bulk upload components
```

### Vendors
```
GET    /api/admin/vendors                   - List all vendors
GET    /api/admin/vendors/:id               - Get vendor details
GET    /api/admin/vendors/:id/inventory     - Get vendor inventory
GET    /api/admin/vendors/:id/sales         - Get vendor sales
PUT    /api/admin/vendors/:id/suspend       - Suspend/activate vendor
GET    /api/admin/vendors/performance       - Get performance metrics
```

### Vendor Requests
```
GET    /api/admin/vendors/requests          - All requests
GET    /api/admin/vendors/requests/pending  - Pending requests
GET    /api/admin/vendors/requests/approved - Approved requests
GET    /api/admin/vendors/requests/rejected - Rejected requests
GET    /api/admin/vendors/requests/:id      - Get request details
PUT    /api/admin/vendors/requests/:id/approve - Approve request
PUT    /api/admin/vendors/requests/:id/reject  - Reject request
```

### Sales & Analytics
```
GET    /api/admin/sales/overview            - Sales overview
GET    /api/admin/sales/reports             - Sales reports
GET    /api/admin/sales/reports/daily       - Daily report
GET    /api/admin/sales/reports/weekly      - Weekly report
GET    /api/admin/sales/reports/monthly     - Monthly report
GET    /api/admin/sales/reports/custom      - Custom date range
GET    /api/admin/sales/analytics/trends    - Sales trends
GET    /api/admin/sales/analytics/products  - Top products
GET    /api/admin/sales/analytics/brands    - Sales by brand
GET    /api/admin/sales/analytics/vendors   - Sales by vendor
GET    /api/admin/sales/revenue             - Revenue tracking
GET    /api/admin/sales/commissions         - Commission data
POST   /api/admin/sales/commissions/calculate - Calculate commissions
```

### Orders
```
GET    /api/admin/orders                    - All orders
GET    /api/admin/orders/:id                - Order details
GET    /api/admin/orders/pending            - Pending orders
GET    /api/admin/orders/completed          - Completed orders
GET    /api/admin/orders/cancelled          - Cancelled orders
PUT    /api/admin/orders/:id/status         - Update order status
```

### Settings
```
GET    /api/admin/settings                  - Get settings
PUT    /api/admin/settings                  - Update settings
```

---

## Vendor API Endpoints

### Inventory
```
GET    /api/vendor/inventory                - All inventory
POST   /api/vendor/inventory                - Add inventory
GET    /api/vendor/inventory/:id            - Get item details
PUT    /api/vendor/inventory/:id            - Update item
DELETE /api/vendor/inventory/:id            - Delete item
PUT    /api/vendor/inventory/:id/restock    - Restock item
GET    /api/vendor/inventory/low-stock      - Low stock alerts
GET    /api/vendor/inventory/out-of-stock   - Out of stock items
POST   /api/vendor/inventory/bulk-update    - Bulk update
```

### Pricing
```
GET    /api/vendor/pricing                  - All pricing
PUT    /api/vendor/pricing/:id              - Update price
POST   /api/vendor/pricing/bulk-edit        - Bulk price update
GET    /api/vendor/pricing/competitive      - Competitive analysis
```

### Requests
```
GET    /api/vendor/requests                 - All requests
GET    /api/vendor/requests/pending         - Pending requests
GET    /api/vendor/requests/approved        - Approved requests
GET    /api/vendor/requests/rejected        - Rejected requests
GET    /api/vendor/requests/:id             - Request details
```

### Sales
```
GET    /api/vendor/sales/overview           - Sales overview
GET    /api/vendor/sales/daily              - Daily sales
GET    /api/vendor/sales/weekly             - Weekly sales
GET    /api/vendor/sales/monthly            - Monthly sales
GET    /api/vendor/sales/analytics/trends   - Sales trends
GET    /api/vendor/sales/analytics/top-products - Top products
GET    /api/vendor/sales/revenue            - Revenue
GET    /api/vendor/sales/earnings           - Earnings (after commission)
GET    /api/vendor/sales/reports/generate   - Generate report
```

### Orders
```
GET    /api/vendor/orders                   - All orders
GET    /api/vendor/orders/:id               - Order details
GET    /api/vendor/orders/pending           - Pending
GET    /api/vendor/orders/processing        - Processing
GET    /api/vendor/orders/shipped           - Shipped
GET    /api/vendor/orders/delivered         - Delivered
GET    /api/vendor/orders/cancelled         - Cancelled
```

### Profile
```
GET    /api/vendor/profile                  - Get profile
PUT    /api/vendor/profile                  - Update profile
```

---

## Customer API Endpoints

### Products & Browsing
```
GET    /api/customer/brands                 - All brands
GET    /api/customer/brands/:id             - Brand details
GET    /api/customer/brands/:id/models      - Models by brand
GET    /api/customer/models/:id             - Model details
GET    /api/customer/models/:id/components  - Components for model
GET    /api/customer/components/:id         - Component details
GET    /api/customer/components/:id/vendors - Vendors selling component
GET    /api/customer/search?q=&brand=&category= - Search products
GET    /api/customer/categories             - All categories
GET    /api/customer/categories/:name       - Products by category
```

### Cart (Redis-backed)
```
GET    /api/customer/cart                   - Get cart
POST   /api/customer/cart/add               - Add to cart
PUT    /api/customer/cart/update/:itemId    - Update cart item
DELETE /api/customer/cart/remove/:itemId    - Remove from cart
DELETE /api/customer/cart/clear             - Clear cart
```

### Checkout
```
POST   /api/customer/checkout/shipping      - Save shipping info
POST   /api/customer/checkout/payment       - Save payment info
GET    /api/customer/checkout/review        - Review order
POST   /api/customer/checkout/confirm       - Confirm order
```

### Orders
```
POST   /api/customer/orders                 - Create order
GET    /api/customer/orders                 - Order history
GET    /api/customer/orders/:id             - Order details
GET    /api/customer/orders/:id/track       - Track order
GET    /api/customer/orders/:id/invoice     - Get invoice
POST   /api/customer/orders/:id/return      - Return request
POST   /api/customer/orders/:id/cancel      - Cancel order
POST   /api/customer/orders/:id/review      - Review product
```

### Account
```
GET    /api/customer/account/profile        - Get profile
PUT    /api/customer/account/profile        - Update profile
GET    /api/customer/account/addresses      - Get addresses
POST   /api/customer/account/addresses      - Add address
PUT    /api/customer/account/addresses/:id  - Update address
DELETE /api/customer/account/addresses/:id  - Delete address
GET    /api/customer/account/payment-methods - Payment methods
GET    /api/customer/account/wishlist       - Get wishlist
POST   /api/customer/account/wishlist       - Add to wishlist
DELETE /api/customer/account/wishlist/:componentId - Remove from wishlist
```

### Support
```
POST   /api/customer/support/contact        - Contact support
GET    /api/customer/support/faq            - Get FAQs
GET    /api/customer/support/track-order/:orderId - Track without login
```

---

## Request/Response Examples

### Create Brand (Admin)
```bash
POST /api/admin/brands
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Apple",
  "description": "Premium smartphones and accessories",
  "image_url": "https://example.com/apple-logo.png"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Apple",
  "description": "Premium smartphones and accessories",
  "image_url": "https://example.com/apple-logo.png",
  "is_active": true,
  "created_at": "2025-11-11T..."
}
```

### Add to Cart (Customer)
```bash
POST /api/customer/cart/add
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "inventory_id": "uuid",
  "quantity": 2
}

Response: 200 OK
{
  "message": "Added to cart",
  "items": [...],
  "total": 199.98
}
```

### Approve Vendor Request (Admin)
```bash
PUT /api/admin/vendors/requests/uuid/approve
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "message": "Request approved"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: Most endpoints require authentication. Use `/api/auth/login` to get a JWT token.
2. **Pagination**: Large datasets may need pagination (to be implemented).
3. **Rate Limiting**: Consider implementing rate limiting for production.
4. **CORS**: Currently allows `localhost:3000`, `localhost:3001`, `localhost:3002`.

---

**Last Updated**: November 11, 2025
