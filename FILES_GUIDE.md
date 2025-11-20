# 🎯 Partify Project Files Guide

## 📊 Project Overview

This document provides a comprehensive guide to understanding the Partify project structure after professional reorganization.

---

## 🏠 Root Level Files

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | 📖 Main project overview and features |
| `CONTRIBUTING.md` | 🤝 Guidelines for contributing to the project |
| `LICENSE` | ⚖️ MIT License |

### Configuration
| File | Purpose |
|------|---------|
| `.prettierrc` | 🎨 Code formatter configuration |
| `.eslintrc.json` | ✅ Linter configuration |
| `.gitignore` | 🚫 Git ignore rules |
| `.env.local` | 🔐 Environment variables (local only, never commit) |

### CI/CD
| Directory | Purpose |
|-----------|---------|
| `.github/workflows/` | ⚙️ GitHub Actions automation |
| `.github/workflows/azure-deploy.yml` | 🚀 Azure deployment pipeline |

---

## 📚 docs/ Directory - Documentation

All comprehensive guides and documentation:

| File | Purpose | When to Read |
|------|---------|--------------|
| `INDEX.md` | 📑 Documentation index & navigation | First! Start here |
| `ARCHITECTURE.md` | 🏗️ System design & data flow | Understanding the system |
| `QUICKSTART.md` | 🚀 5-minute setup | First-time setup |
| `DEVELOPMENT.md` | 💻 Development guide | Before coding |
| `DEPLOYMENT.md` | 📦 Production deployment | Before going live |
| `AZURE_DEPLOYMENT.md` | ☁️ Azure-specific deployment | Deploying to Azure |

---

## 🚀 infra/ Directory - Infrastructure

Infrastructure and deployment configurations:

```
infra/
├── bicep/                          # Azure Infrastructure as Code
│   └── azure-deploy.bicep         # Complete Azure setup
│
├── docker/                         # Containerization
│   ├── Dockerfile.backend         # Node.js backend container
│   ├── Dockerfile.frontend        # React + Nginx container
│   ├── docker-compose.yml         # Local multi-service setup
│   └── nginx.conf                 # Nginx reverse proxy config
│
└── terraform/                      # Terraform IaC (existing)
    ├── main.tf                    # Azure resources
    ├── variables.tf               # Configuration variables
    ├── outputs.tf                 # Outputs
    └── deploy.sh                  # Deployment script
```

### Bicep Files
- **infra/bicep/azure-deploy.bicep** - Defines all Azure resources (App Service, PostgreSQL, Redis, Key Vault, etc.)

### Docker Files
- **infra/docker/Dockerfile.backend** - Multi-stage build for Node.js backend
- **infra/docker/Dockerfile.frontend** - Multi-stage build for React frontend
- **infra/docker/docker-compose.yml** - Local development environment with all services
- **infra/docker/nginx.conf** - Production Nginx configuration with security headers and caching

---

## 💾 Backend Directory Structure

```
backend/
├── config/                        # Configuration
│   ├── supabase.js               # Supabase database client
│   ├── redis.js                  # Redis cache client
│   ├── azure.js                  # Azure Blob Storage client
│   └── pinecone.js               # Pinecone vector DB (fallback)
│
├── middleware/                    # Express middleware
│   └── auth.js                   # JWT verification, role-based access
│
├── routes/                        # API endpoints
│   ├── auth.js                   # Authentication endpoints
│   ├── adminApi.js               # Admin CRUD operations
│   ├── vendorApi.js              # Vendor endpoints
│   ├── customerApi.js            # Customer endpoints
│   └── search.js                 # Search & AI endpoints
│
├── services/                      # Business logic
│   ├── qaDatabase.js             # In-memory Q&A search (113 entries)
│   └── vectorSearch.js           # Vector embeddings (Mistral API)
│
├── package.json                  # Dependencies
├── server.js                     # Express app setup & routes
└── backend.log                   # Log file (local only)
```

### Key Files Explained

**config/supabase.js** - Initializes Supabase PostgreSQL database client
**middleware/auth.js** - JWT token verification and role authorization
**routes/adminApi.js** - Admin dashboard, vendor approval, orders, sales
**routes/vendorApi.js** - Vendor inventory, requests, sales analytics
**routes/customerApi.js** - Customer store, cart, orders
**routes/search.js** - AI search endpoint with fallback QA database
**services/qaDatabase.js** - In-memory search with 113 Q&A entries
**services/vectorSearch.js** - Mistral API embeddings with mock fallback

---

## 🎨 Frontend Directory Structure

```
unified-portal/
├── src/
│   ├── pages/                     # Page components
│   │   ├── Login.jsx              # Authentication
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx      # Admin home
│   │   │   ├── sales/
│   │   │   │   └── SalesDashboard.jsx  # Sales analytics
│   │   │   └── ...
│   │   ├── vendor/
│   │   │   └── ...
│   │   └── customer/
│   │       ├── HomePage.jsx       # Store homepage
│   │       └── ...
│   │
│   ├── components/                # Reusable components
│   │   ├── Navigation.jsx         # Role-based navigation
│   │   ├── Footer.jsx             # Footer
│   │   └── ...
│   │
│   ├── store/                     # State management
│   │   └── cartStore.js           # Zustand cart store
│   │
│   ├── styles/                    # Global styles
│   │   └── apple.css              # Main stylesheet
│   │
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # React entry point
│
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── index.html                     # HTML template
└── dist/                          # Built files (after npm run build)
```

### Key Files Explained

**pages/admin/sales/SalesDashboard.jsx** - Comprehensive sales analytics (NEW)
- Revenue metrics filtered by delivery status
- Time range filtering (7/30/90/365 days)
- Top products and vendors tables
- CSV export functionality
- ~370 lines of production React

**pages/customer/HomePage.jsx** - Customer store homepage
- Product browsing by brand
- AI search (limited to 1 result)
- Cart integration

**components/Navigation.jsx** - Role-based navigation (UPDATED)
- Admin: Vendors, Orders, Sales, Products
- Vendor: Inventory, Requests, Sales
- Customer: Brands, Products, Cart, Orders (Account removed)

**store/cartStore.js** - Zustand store for cart state

---

## 🗄️ Database Directory

```
database/
├── schema-complete.sql            # Full database schema with all tables
├── schema.sql                     # Legacy schema file
└── seed-users.sql                 # Initial test data
```

### Database Tables

**Users & Authentication:**
- `users` - Supabase auth users with role metadata

**Catalog:**
- `brands` - Phone brands
- `phone_models` - Device models
- `components` - Hardware components

**Vendor System:**
- `vendors` - Vendor profiles with approval status
- `vendor_inventory` - Component listings with pricing

**Orders:**
- `orders` - Order records with status tracking
- `order_items` - Order line items

**Q&A & Support:**
- `qa_database` - 113 question-answer pairs for search

---

## 🔐 Security Files

### Environment Variables (.env.local)
```
SUPABASE_URL                 # Supabase project URL
SUPABASE_SERVICE_KEY         # Supabase service role key
MISTRAL_API_KEY              # Mistral AI API key
JWT_SECRET                   # JWT signing secret
REDIS_URL                    # Redis connection URL (optional locally)
```

### Security Practices
✅ All hardcoded keys removed
✅ Sensitive data in environment variables
✅ Azure Key Vault for production secrets
✅ JWT token-based authentication
✅ Role-based access control

---

## 🚀 Deployment Files

### Bicep (Azure)
- **infra/bicep/azure-deploy.bicep** - Single template defining:
  - Container Registry
  - App Service Plan
  - Backend & Frontend Web Apps
  - PostgreSQL Database
  - Redis Cache
  - Key Vault

### Docker
- **infra/docker/Dockerfile.backend** - Node.js 18 Alpine
- **infra/docker/Dockerfile.frontend** - Multi-stage React build
- **infra/docker/docker-compose.yml** - Local testing environment

### GitHub Actions
- **.github/workflows/azure-deploy.yml** - CI/CD pipeline
  - Triggers on push to main
  - Builds Docker images
  - Pushes to Azure Container Registry
  - Deploys to App Service

---

## 📋 Quick Navigation

### I want to...

**Understand the project**
→ Read `README.md` → Then `docs/INDEX.md` → Then `docs/ARCHITECTURE.md`

**Set up locally**
→ Follow `docs/QUICKSTART.md`

**Start developing**
→ Follow `docs/DEVELOPMENT.md`

**Deploy to Azure**
→ Follow `docs/AZURE_DEPLOYMENT.md`

**Add a new feature**
→ Check `docs/DEVELOPMENT.md` → Modify `backend/routes/` or `unified-portal/src/`

**Fix a bug**
→ Check backend logs in `backend/server.js` output

**Update documentation**
→ Edit relevant file in `docs/` or add new file

**Check code style**
→ Use `.prettierrc` formatting and `.eslintrc.json` rules

**Deploy infrastructure**
→ Use `infra/bicep/azure-deploy.bicep` or `infra/terraform/`

---

## 🎯 File Statistics

| Metric | Count |
|--------|-------|
| Documentation files | 6 |
| Infrastructure files | 10+ |
| Backend routes | 10+ |
| Frontend pages | 15+ |
| Database tables | 12+ |
| Configuration files | 4 |
| Total project files | 100+ |

---

## 📈 Recent Changes (Nov 19, 2025)

✅ **Professional Reorganization**
- Created `docs/` for all documentation
- Created `infra/` for infrastructure files
- Added `.prettierrc` and `.eslintrc.json`
- Updated README with new structure
- Created `docs/ARCHITECTURE.md` (500+ lines)
- Created `docs/INDEX.md` for navigation

✅ **Completed Features**
- Sales Dashboard with analytics
- AI search limited to 1 result
- In-memory QA database (113 entries)
- Account section removed from customer portal
- All hardcoded API keys secured

---

## 🔗 Related Resources

- **GitHub**: https://github.com/SakethKudupudi/Partify
- **Branch**: feature/improvements-sales-search
- **Main Branch**: Untouched (ready for production)

---

**Version**: 2.0 (Reorganized)
**Last Updated**: November 19, 2025
**Maintained By**: Saketh Kudupudi
