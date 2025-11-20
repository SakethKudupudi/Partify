# System Architecture

## Overview

Partify is a multi-tenant e-commerce platform with a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Layer                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Admin Portal   │  Vendor Portal  │  Customer Portal            │
│  (React/Vite)   │  (React/Vite)   │  (React/Vite)               │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
         └─────────────────┴───────────────────────┘
                    │
                    ▼ (HTTP/REST)
┌─────────────────────────────────────────────────────────────────┐
│                  API Layer (Express.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication (JWT)                                          │
│  • Authorization (Role-based)                                    │
│  • Request validation                                            │
│  • Error handling                                                │
│  • Rate limiting                                                 │
└────────┬─────────────┬──────────────┬──────────────┬─────────────┘
         │             │              │              │
         ▼             ▼              ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐
    │ Admin   │  │ Vendor   │  │ Customer  │  │ Search/AI    │
    │ Routes  │  │ Routes   │  │ Routes    │  │ Routes       │
    └────┬────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘
         │             │              │              │
         └─────────────┴──────────────┴──────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌────────┐ ┌──────────┐ ┌─────────────┐
    │Supabase│ │  Redis   │ │ Azure Blob  │
    │  DB    │ │  Cache   │ │  Storage    │
    └────────┘ └──────────┘ └─────────────┘
```

## Database Architecture

### Primary Database: Supabase PostgreSQL

**Core Tables:**

```sql
brands
├── id (UUID)
├── name
├── logo_url
└── is_active

phone_models
├── id (UUID)
├── brand_id (FK)
├── name
├── model_number
└── is_active

components
├── id (UUID)
├── category
├── name
├── description
└── is_active

users (Supabase Auth)
├── id (UUID)
├── email
├── role (admin|vendor|customer)
└── metadata

vendors
├── id (UUID)
├── user_id (FK)
├── store_name
├── status (pending|approved|rejected)
└── approval_date

vendor_inventory
├── id (UUID)
├── vendor_id (FK)
├── phone_model_id (FK)
├── component_id (FK)
├── quantity
├── proposed_price
├── status (pending|approved|rejected)
└── created_at

orders
├── id (UUID)
├── customer_id (FK)
├── order_number
├── total_amount
├── status (confirmed|processing|shipped|delivered)
└── created_at

order_items
├── id (UUID)
├── order_id (FK)
├── vendor_inventory_id (FK)
├── quantity
└── price
```

### Caching Layer: Redis

**Cache Keys:**

```
cart:{user_id}              # User shopping cart
user:{user_id}              # User session data
inventory:{inventory_id}    # Product cache
vendor:{vendor_id}          # Vendor profile cache
brands:list                 # All brands
models:{brand_id}           # Models by brand
```

## API Layer Architecture

### Authentication Flow

```
Login Request
    │
    ▼
Validate Credentials (Supabase Auth)
    │
    ├─ Valid ─→ Generate JWT Token
    │           └─→ Return Token
    │
    └─ Invalid ─→ Return 401 Unauthorized
```

### Route Protection

```
Incoming Request
    │
    ▼
Check Authorization Header
    │
    ├─ Missing ─→ 401 Unauthorized
    │
    ▼
Verify JWT Signature
    │
    ├─ Invalid ─→ 403 Forbidden
    │
    ▼
Check User Role
    │
    ├─ Insufficient ─→ 403 Forbidden
    │
    ▼
Execute Route Handler
```

### API Endpoints

#### Admin Routes (`/api/admin`)
- `GET /stats` - Dashboard statistics
- `GET /vendors` - All vendor requests
- `POST /vendors/:id/approve` - Approve vendor
- `POST /vendors/:id/reject` - Reject vendor
- `GET /orders` - All orders
- `GET /sales` - Sales analytics
- `POST /brands` - Create brand
- `POST /components` - Create component

#### Vendor Routes (`/api/vendor`)
- `GET /inventory` - Vendor's inventory
- `POST /inventory` - Add to inventory
- `PUT /inventory/:id` - Update inventory
- `GET /requests` - Pending requests
- `GET /sales` - Vendor sales analytics
- `GET /orders` - Vendor orders

#### Customer Routes (`/api/customer`)
- `GET /brands` - Browse brands
- `GET /models/:brandId` - Browse models
- `GET /inventory` - Search inventory
- `POST /cart` - Manage cart
- `POST /orders` - Create order
- `GET /orders` - Order history
- `GET /search/qa` - AI search (Q&A database)

## Frontend Architecture

### State Management

```
App (Root)
├── Authentication State
│   ├── user (current user)
│   ├── token (JWT)
│   └── role (admin|vendor|customer)
├── Cart State (Zustand/localStorage)
│   ├── items
│   ├── total
│   └── lastUpdated
└── UI State
    ├── loading
    ├── error
    └── notifications
```

### Component Hierarchy

```
App
├── Layout
│   ├── Navigation
│   │   └── Role-based menu
│   ├── Router
│   │   ├── Admin Portal
│   │   │   ├── Dashboard
│   │   │   ├── Vendors
│   │   │   ├── Orders
│   │   │   ├── Products
│   │   │   └── Sales
│   │   ├── Vendor Portal
│   │   │   ├── Dashboard
│   │   │   ├── Inventory
│   │   │   ├── Requests
│   │   │   └── Sales
│   │   └── Customer Portal
│   │       ├── Home
│   │       ├── Brands
│   │       ├── Products
│   │       ├── Cart
│   │       └── Orders
│   └── Footer
```

## Data Flow

### Product Search Flow

```
User Search Query
    │
    ▼
Frontend: POST /api/search/qa
    │
    ├─ Try Pinecone Vector DB
    │   │
    │   ├─ Success ─→ Return results
    │   │
    │   └─ Fail ─→ Fall through
    │
    ├─ Try In-Memory QA Database
    │   │
    │   ├─ Success ─→ Return results
    │   │
    │   └─ Fail ─→ Fall through
    │
    └─ Try Mock Embeddings
        └─→ Return cached results
```

### Order Flow

```
1. Add to Cart
   └─→ Store in Redis: cart:{user_id}

2. Checkout
   ├─→ Validate inventory
   ├─→ Calculate total
   └─→ Store checkout session in Redis

3. Create Order
   ├─→ Insert order in Supabase
   ├─→ Create order items
   ├─→ Clear cart from Redis
   └─→ Return order confirmation

4. Order Status
   ├─→ Customer tracks: GET /orders/{id}
   ├─→ Vendor manages: PUT /orders/{id}/status
   └─→ Admin oversees: GET /orders
```

## Deployment Architecture

### Local Development

```
Docker Compose (Optional)
├── PostgreSQL 15
├── Redis 7
├── Backend (Node.js 18)
└── Frontend (Nginx)
```

### Azure Production

```
Resource Group: partify-rg
├── Container Registry
│   ├── partify-backend:latest
│   └── partify-frontend:latest
├── App Service Plan (Linux)
│   ├── Backend Web App
│   │   └── Node.js 18-lts
│   └── Frontend Web App
│       └── Static Web App
├── PostgreSQL Server
│   └── partify_db
├── Redis Cache
│   └── partify-redis
└── Key Vault
    ├── supabase-url
    ├── supabase-service-key
    ├── mistral-api-key
    └── jwt-secret
```

### CI/CD Pipeline

```
GitHub Push
    │
    ├─ feature/* → Feature testing
    └─ main → Production deployment
        │
        ▼
    Build Docker Images
        │
        ├─ Build backend
        └─ Build frontend
        │
        ▼
    Push to ACR
        │
        ├─ partify-backend:sha
        └─ partify-frontend:sha
        │
        ▼
    Deploy to Azure
        │
        ├─ Update App Service
        └─ Update Static Web App
        │
        ▼
    Smoke Tests
        │
        ▼
    Monitor & Alert
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────┐
│ Supabase Authentication             │
├─────────────────────────────────────┤
│ • Email/Password signup             │
│ • Email verification                │
│ • JWT token generation              │
│ • Token refresh flow                │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend JWT Verification            │
├─────────────────────────────────────┤
│ • Extract token from header         │
│ • Verify signature                  │
│ • Check expiration                  │
│ • Decode claims                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Role-Based Access Control (RBAC)    │
├─────────────────────────────────────┤
│ • Admin access                      │
│ • Vendor access                     │
│ • Customer access                   │
└─────────────────────────────────────┘
```

### Data Security

- **At Rest**: PostgreSQL encryption, Azure Key Vault
- **In Transit**: HTTPS/TLS, signed JWTs
- **Sensitive Data**: Environment variables, no hardcoding
- **API Keys**: Azure Key Vault management

## Scaling Considerations

### Horizontal Scaling

```
Load Balancer
├── Backend Instance 1 (port 8080)
├── Backend Instance 2 (port 8080)
└── Backend Instance 3 (port 8080)
    └─→ Shared Redis
    └─→ Shared PostgreSQL
    └─→ Shared Azure Blob Storage
```

### Caching Strategy

```
L1 Cache: In-Memory (Fast)
├── Current user context
├── UI state
└── Search results

L2 Cache: Redis (Medium)
├── User sessions
├── Cart data
└── Popular inventory

L3 Cache: CDN (Slow but large)
├── Static assets
├── Images
└── API responses
```

### Database Optimization

```
Indexes:
├── users(email) - Authentication
├── vendor_inventory(vendor_id, status)
├── vendor_inventory(phone_model_id)
├── orders(customer_id, created_at)
└── order_items(order_id)

Partitioning:
├── Orders by date
└── Vendor inventory by brand
```

## Monitoring & Observability

### Logging

```
Application Logs
├── Backend: Console + File
├── Frontend: Browser console
└── Azure: Application Insights

Log Levels:
├── ERROR - Critical issues
├── WARN - Warnings
├── INFO - General information
└── DEBUG - Development details
```

### Metrics

```
Performance:
├── API response time
├── Database query time
├── Cache hit rate
└── Search latency

Business:
├── Active users
├── Revenue
├── Order count
└── Vendor count
```
