# Quick Start Guide

## Project Structure

```
partify/
├── backend/                 # Node.js Express API server
│   ├── routes/             # API endpoint handlers
│   ├── middleware/         # Authentication & utilities
│   ├── config/             # Database, Redis, Azure config
│   ├── server.js           # Main server file
│   └── package.json
├── unified-portal/         # React 18 Frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Shared components
│   │   └── store/          # State management
│   └── package.json
├── database/               # PostgreSQL schema & migrations
│   ├── schema.sql          # Main database schema
│   ├── migrations/         # Migration scripts
│   └── seed-users.sql      # Initial data
├── terraform/              # Infrastructure as Code
│   ├── main.tf             # Azure resources
│   └── deploy.sh           # Deployment script
├── README.md               # Project overview
├── CONTRIBUTING.md         # How to contribute
├── DEVELOPMENT.md          # Development guide
├── DEPLOYMENT.md           # Production deployment
└── LICENSE                 # MIT License
```

## Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/SakethKudupudi/Partify.git
cd Partify
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd unified-portal && npm install && cd ..
```

### 3. Configure Environment
```bash
# Create .env.local files with required variables
# See DEVELOPMENT.md for full environment setup
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd unified-portal
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Admin Portal: http://localhost:3000/admin (login with admin account)
- Vendor Portal: http://localhost:3000/vendor (login with vendor account)
- Customer Portal: http://localhost:3000 (login with customer account)

## Key Features

### For Admins
- ✅ Manage vendors
- ✅ Approve/reject inventory requests
- ✅ View all orders
- ✅ Monitor sales analytics

### For Vendors
- 📦 Add phone components to inventory
- ✅ Track request approvals
- 📊 View sales and inventory
- 💰 Monitor revenue

### For Customers
- 🛍️ Browse phone models and components
- 🔍 Compare prices from vendors
- 🛒 Shopping cart with Redis
- 📦 Place orders and track
- ⭐ Leave reviews

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Admin APIs
- `GET /api/admin/vendors` - List vendors
- `GET /api/admin/vendors/requests` - Pending vendor requests
- `PUT /api/admin/vendors/requests/:id/approve` - Approve request
- `GET /api/admin/orders` - View all orders

### Customer APIs
- `GET /api/customer/models` - List phone models
- `GET /api/customer/models/:id/components` - Get model components
- `POST /api/customer/cart` - Add to cart
- `POST /api/customer/orders` - Place order
- `GET /api/customer/orders` - View orders

### Vendor APIs
- `GET /api/vendor/inventory` - List inventory
- `POST /api/vendor/inventory` - Add inventory
- `GET /api/vendor/requests` - View inventory requests

## Database Tables

### Core Tables
- `users` - User accounts (admin, vendor, customer)
- `vendors` - Vendor profiles
- `brands` - Phone brands (Apple, Samsung, etc.)
- `phone_models` - Phone models by brand
- `components` - Phone components (battery, screen, etc.)
- `vendor_inventory` - Vendor product listings with pricing
- `orders` - Customer orders
- `order_items` - Items in each order

## Technology Stack

### Frontend
- React 18.2
- Vite 5.0
- React Router v6
- React Hot Toast

### Backend
- Node.js 18+
- Express.js
- Supabase (PostgreSQL)
- Redis
- Azure Blob Storage
- JWT Authentication

### Infrastructure
- Azure App Services
- Azure Redis Cache
- Azure Blob Storage
- Supabase Hosting

## Common Tasks

### Add a New Page
1. Create component in `unified-portal/src/pages/`
2. Add route in `App.jsx`
3. Add navigation link if needed

### Create New API Endpoint
1. Create route handler in `backend/routes/`
2. Add verification middleware
3. Update API documentation

### Database Migration
1. Create SQL file in `database/migrations/`
2. Follow naming: `YYYY-MM-DD-description.sql`
3. Run migration script
4. Update `schema.sql` for reference

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:8080 | xargs kill -9
```

### Redis Connection Error
```bash
# Verify Redis is running
redis-cli ping
# Should respond: PONG
```

### Database Connection Issues
- Verify Supabase URL in .env
- Check service role key has proper permissions
- Verify network access to Supabase

### Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Documentation

- **README.md** - Project overview and features
- **CONTRIBUTING.md** - How to contribute
- **DEVELOPMENT.md** - Architecture and development guide
- **DEPLOYMENT.md** - Production deployment instructions

## Getting Help

1. Check existing documentation
2. Review GitHub issues
3. Check code comments
4. Create a new issue with details

## Production Deployment

For production deployment:
1. See `DEPLOYMENT.md` for complete guide
2. Use Terraform for infrastructure
3. Configure Azure resources
4. Set up CI/CD pipeline
5. Run database migrations
6. Deploy frontend to Azure Static Web Apps
7. Deploy backend to Azure App Service

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues or questions:
- 📧 Create an issue on GitHub
- 📖 Check documentation files
- 🔗 Review API endpoints
- 💬 Check code comments
