# 📚 Documentation Index

Welcome to Partify documentation. Start here to navigate all available guides and references.

## 🚀 Getting Started

**New to the project?** Start with these:

1. **[README.md](../README.md)** - Project overview and features
2. **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick start guide
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and data flow

## 📖 Comprehensive Guides

### Development
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development setup and workflow
  - Project structure
  - API endpoints
  - Testing strategies
  - Common debugging

### Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
  - Azure setup
  - Database migrations
  - Environment configuration
  - Backup & restore

- **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** - Azure Web Services setup
  - Step-by-step Azure deployment
  - Container Registry setup
  - Key Vault configuration
  - CI/CD pipeline automation

### Contributing
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - Contributing guidelines
  - Code style
  - Pull request process
  - Testing requirements

## 🏗️ Infrastructure

Located in `infra/` directory:

### Docker
- **infra/docker/Dockerfile.backend** - Node.js backend container
- **infra/docker/Dockerfile.frontend** - React frontend container
- **infra/docker/docker-compose.yml** - Local testing setup
- **infra/docker/nginx.conf** - Nginx configuration

### Infrastructure as Code
- **infra/bicep/azure-deploy.bicep** - Azure resources (Bicep)
- **infra/terraform/** - Terraform configuration

### CI/CD
- **.github/workflows/azure-deploy.yml** - GitHub Actions pipeline

## 🔑 Key Concepts

### Authentication & Security
- JWT-based authentication via Supabase
- Role-based access control (Admin, Vendor, Customer)
- Environment variable management for secrets
- Hardcoded keys removed; all sensitive data in Key Vault

### Data Management
- PostgreSQL (Supabase) for persistence
- Redis for caching and sessions
- Azure Blob Storage for images
- Vector search with fallback QA database

### Features
- **Admin Dashboard** - Vendor approval, sales analytics, order management
- **Vendor Portal** - Inventory management, price setting, sales tracking
- **Customer Store** - Product browsing, cart management, order tracking
- **AI Search** - Intelligent Q&A search with Mistral embeddings

## 📊 Recent Enhancements

✅ **Sales Dashboard** - Comprehensive admin analytics with delivery-based revenue filtering

✅ **AI Search** - Limited to 1 result per query; in-memory QA database with 113 entries

✅ **Security Hardening** - All hardcoded API keys removed; environment variables implemented

✅ **Azure Deployment** - Complete infrastructure templates and CI/CD pipeline

✅ **Professional Structure** - Organized docs/, infra/ directories; configuration files added

## 🛠️ Code Quality

- **Prettier** (.prettierrc) - Code formatting
- **ESLint** (.eslintrc.json) - Code linting
- **.gitignore** - Version control exclusions

## 📝 Quick Reference

### Port Numbers
- Backend API: `8080`
- Frontend: `3000`
- PostgreSQL: `5432`
- Redis: `6379`

### Environment Variables Required
```bash
SUPABASE_URL              # Supabase project URL
SUPABASE_SERVICE_KEY      # Supabase service role key
MISTRAL_API_KEY          # Mistral AI API key
JWT_SECRET               # JWT signing secret
REDIS_URL                # Redis connection URL
```

### Default Test Users
- **Admin**: admin@partify.com / admin123
- **Vendor**: vendor@partify.com / vendor123
- **Customer**: customer@partify.com / customer123

## 🔍 Finding Information

| Need | Location |
|------|----------|
| API endpoints | [DEVELOPMENT.md](./DEVELOPMENT.md#api-documentation) |
| Database schema | [../database/schema-complete.sql](../database/schema-complete.sql) |
| Deployment steps | [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) |
| Architecture overview | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Contributing rules | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| Local development | [DEVELOPMENT.md](./DEVELOPMENT.md) |

## 🚀 Next Steps

1. **First time?** → Read [QUICKSTART.md](./QUICKSTART.md)
2. **Want to develop?** → Start with [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Ready to deploy?** → Follow [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)
4. **Contributing?** → Check [../CONTRIBUTING.md](../CONTRIBUTING.md)
5. **Understanding architecture?** → Review [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📞 Support

- 📧 Create an issue on GitHub
- 📖 Check relevant documentation
- 💬 Review code comments and examples

---

**Last Updated**: November 19, 2025
**Current Branch**: feature/improvements-sales-search
