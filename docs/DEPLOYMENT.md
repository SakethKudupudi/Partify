# Deployment Guide

## Production Deployment

### Prerequisites

- Azure account with active subscription
- Docker installed locally
- Terraform >= 1.0
- GitHub account for source control

### Environment Setup

1. **Azure Resources**
   - Create Azure App Services for backend and frontend
   - Set up Azure Database for PostgreSQL (or use Supabase)
   - Configure Azure Redis Cache
   - Set up Azure Blob Storage

2. **Supabase Project**
   - Create production Supabase project
   - Apply database migrations
   - Configure authentication settings
   - Set up RLS policies

3. **Environment Variables**

**Backend (.env.production)**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=redis://hostname:6379
AZURE_STORAGE_ACCOUNT=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
```

**Frontend (.env.production)**
```
VITE_API_URL=https://your-api-domain.com
```

### Deployment Steps

#### 1. Backend Deployment

```bash
# Build backend
cd backend
npm install --production
npm run build

# Deploy to Azure App Service
az webapp deployment source config-zip \
  --resource-group your-rg \
  --name your-backend-app \
  --src backend.zip

# Or using Azure CLI directly
az appservice plan create \
  --name partify-plan \
  --resource-group partify-rg \
  --sku B2

az webapp create \
  --resource-group partify-rg \
  --plan partify-plan \
  --name partify-backend \
  --runtime "NODE|18-lts"
```

#### 2. Frontend Deployment

```bash
# Build frontend
cd unified-portal
npm install
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name partify-frontend \
  --resource-group partify-rg \
  --source ./unified-portal \
  --branch main \
  --app-build-command "npm run build" \
  --app-location "." \
  --output-location "dist"
```

#### 3. Database Migrations

```bash
# Connect to Supabase
psql postgresql://user:password@host:5432/postgres

# Run schema
psql -h host -U user -d database -f database/schema.sql

# Run seed data (if applicable)
psql -h host -U user -d database -f database/seed-users.sql
```

### Using Terraform

```bash
cd terraform

# Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply deployment
terraform apply tfplan

# View outputs
terraform output
```

### Docker Deployment

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

**Build and deploy**
```bash
# Build image
docker build -t partify-backend:latest .

# Tag for registry
docker tag partify-backend:latest your-registry/partify-backend:latest

# Push to registry
docker push your-registry/partify-backend:latest
```

## Health Checks & Monitoring

### Backend Health Endpoint
```bash
curl https://your-api-domain.com/health
# Expected response:
# {"status":"OK","timestamp":"2025-11-18T16:30:03.008Z"}
```

### Application Insights

1. Enable monitoring in Azure
2. Configure log collection
3. Set up alerts for:
   - Error rate > 5%
   - Response time > 2s
   - High memory usage
   - Redis connection failures

### Error Tracking

- Monitor `/api/*/error` logs
- Check database query performance
- Review authentication failures
- Track Redis cache hits/misses

## Database Maintenance

### Backups

```bash
# Manual backup
pg_dump -h your-host -U user -d database > backup.sql

# Restore backup
psql -h your-host -U user -d database < backup.sql
```

### Performance Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM vendor_inventory WHERE status = 'approved';

-- Create indexes
CREATE INDEX idx_vendor_inventory_status ON vendor_inventory(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

## Scaling Considerations

### Horizontal Scaling

1. **API Servers**
   - Use Azure Load Balancer
   - Configure auto-scaling based on CPU/memory
   - Use sticky sessions for stateful operations

2. **Database**
   - Enable read replicas for reporting
   - Use connection pooling
   - Implement caching layer

3. **Storage**
   - Use CDN for blob storage
   - Implement image optimization
   - Configure cache headers

### Vertical Scaling

- Upgrade App Service tier
- Increase Redis memory
- Increase database compute

## Rollback Procedure

```bash
# Rollback to previous deployment
az webapp deployment slot swap \
  --resource-group partify-rg \
  --name partify-backend \
  --slot staging

# Or rollback git
git revert HEAD~1
git push main
```

## Security Considerations

1. **Secrets Management**
   - Use Azure Key Vault
   - Never commit secrets to git
   - Rotate credentials regularly

2. **SSL/TLS**
   - Use HTTPS everywhere
   - Configure HSTS
   - Monitor certificate expiration

3. **Network Security**
   - Enable WAF on frontend
   - Use VPC/VNet for internal communication
   - Restrict database access

4. **Data Protection**
   - Enable encryption at rest
   - Enable encryption in transit
   - Regular security audits

## Monitoring & Alerting

### Key Metrics

```
Backend:
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Database query time
- Redis latency

Frontend:
- Load time
- Core Web Vitals
- JavaScript errors
- API call failures
```

### Alert Configuration

```
- High error rate (> 1%)
- High latency (> 5s)
- Database down
- Redis down
- Disk space critical
- Memory threshold exceeded
```

## Troubleshooting Deployment

### Issues & Solutions

**Deployment fails**
- Check deployment logs: `az webapp log tail --resource-group rg --name app`
- Verify environment variables
- Check database connectivity

**High error rate post-deployment**
- Verify all environment variables set
- Check database migrations applied
- Review recent code changes

**Slow performance**
- Check database indexes
- Monitor Redis memory usage
- Review slow query logs

**Authentication failures**
- Verify JWT secret configured
- Check token expiration
- Validate Supabase configuration

## Support

For deployment issues:
1. Check Azure documentation
2. Review application logs
3. Check database health
4. Test API endpoints individually
5. Contact cloud provider support if needed
