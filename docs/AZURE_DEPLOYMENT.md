# 🚀 Azure Deployment Guide for Partify

## Prerequisites

Before deploying to Azure, ensure you have:

1. **Azure Account** - [Create free account](https://azure.microsoft.com/free/)
2. **Azure CLI** - `brew install azure-cli` (macOS) or [download](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Docker** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
4. **GitHub Account** - For CI/CD pipeline
5. **Required Tools**:
   ```bash
   # Install Azure CLI extensions
   az extension add --name containerapp
   ```

## Step 1: Set Up Azure Resources

### 1.1 Create Resource Group
```bash
az group create \
  --name partify-rg \
  --location eastus
```

### 1.2 Deploy Infrastructure (Bicep)
```bash
az deployment group create \
  --name partify-deployment \
  --resource-group partify-rg \
  --template-file azure-deploy.bicep \
  --parameters location=eastus environment=prod projectName=partify
```

### 1.3 Create Container Registry
```bash
az acr create \
  --resource-group partify-rg \
  --name partifyacr \
  --sku Basic \
  --admin-enabled true
```

## Step 2: Configure Azure Key Vault

### 2.1 Create Secrets in Key Vault
```bash
KEY_VAULT_NAME="partify-prod-kv"

# Add secrets
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name supabase-url \
  --value "your-supabase-url"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name supabase-service-key \
  --value "your-supabase-key"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name mistral-api-key \
  --value "your-mistral-key"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name jwt-secret \
  --value "your-jwt-secret"
```

## Step 3: Build & Push Docker Images

### 3.1 Build Backend Image
```bash
ACR_URL="partifyacr.azurecr.io"

docker build -f Dockerfile.backend -t $ACR_URL/partify-backend:latest .

az acr login --name partifyacr

docker push $ACR_URL/partify-backend:latest
```

### 3.2 Build Frontend Image
```bash
docker build -f Dockerfile.frontend -t $ACR_URL/partify-frontend:latest .
docker push $ACR_URL/partify-frontend:latest
```

## Step 4: Deploy Applications

### 4.1 Deploy Backend to App Service
```bash
# Create App Service Plan (if not created by Bicep)
az appservice plan create \
  --name partify-plan \
  --resource-group partify-rg \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --resource-group partify-rg \
  --plan partify-plan \
  --name partify-backend \
  --deployment-container-image-name $ACR_URL/partify-backend:latest

# Configure container settings
az webapp config container set \
  --name partify-backend \
  --resource-group partify-rg \
  --docker-custom-image-name $ACR_URL/partify-backend:latest \
  --docker-registry-server-url https://$ACR_URL \
  --docker-registry-server-user partifyacr \
  --docker-registry-server-password $(az acr credential show --name partifyacr --query passwords[0].value -o tsv)
```

### 4.2 Deploy Frontend to Static Web App
```bash
az staticwebapp create \
  --name partify-frontend \
  --resource-group partify-rg \
  --source https://github.com/your-username/Partify \
  --branch main \
  --location eastus \
  --app-location unified-portal \
  --app-build-command "npm run build" \
  --output-location dist \
  --token $GITHUB_TOKEN
```

## Step 5: Configure CI/CD Pipeline

### 5.1 Set Up GitHub Secrets
In your GitHub repository settings, add:

```
AZURE_CREDENTIALS: (run az ad sp create-for-rbac --name "Partify" --sdk-auth)
AZURE_STATIC_WEB_APPS_TOKEN: (from Static Web App deployment center)
```

### 5.2 Generate Azure Service Principal
```bash
az ad sp create-for-rbac \
  --name "Partify" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/partify-rg \
  --sdk-auth
```

Copy the output JSON to GitHub secret `AZURE_CREDENTIALS`.

## Step 6: Monitor & Manage

### 6.1 View Application Logs
```bash
# Backend logs
az webapp log tail \
  --name partify-backend \
  --resource-group partify-rg

# Frontend logs
az staticwebapp logs \
  --name partify-frontend \
  --resource-group partify-rg
```

### 6.2 Scale Resources
```bash
# Scale App Service Plan
az appservice plan update \
  --name partify-plan \
  --resource-group partify-rg \
  --sku S1

# Scale Redis Cache
az redis update \
  --name partify-prod-redis \
  --resource-group partify-rg \
  --sku Standard \
  --size c1
```

### 6.3 Monitor Performance
```bash
# View metrics
az monitor metrics list \
  --resource /subscriptions/{subscription-id}/resourceGroups/partify-rg/providers/Microsoft.Web/sites/partify-backend \
  --metric "Http5xx" \
  --start-time 2025-01-01T00:00:00Z
```

## Estimated Costs

| Service | SKU | Monthly Cost |
|---------|-----|-------------|
| App Service Plan | B1 | $15-25 |
| PostgreSQL | Basic Gen5 | $30-50 |
| Redis Cache | Basic C0 | $15-20 |
| Container Registry | Basic | $5 |
| Static Web App | Free | $0 |
| **Total** | | **$65-100** |

## Troubleshooting

### Issue: Container won't start
```bash
# Check container logs
az webapp log show --name partify-backend --resource-group partify-rg

# Verify environment variables
az webapp config appsettings list --name partify-backend --resource-group partify-rg
```

### Issue: API requests failing
```bash
# Test health endpoint
curl https://partify-backend.azurewebsites.net/health

# Check backend logs
az webapp log tail --name partify-backend --resource-group partify-rg --follow
```

### Issue: Database connection errors
```bash
# Verify PostgreSQL firewall rules
az postgres server firewall-rule list --resource-group partify-rg --server-name partify-postgres

# Allow Azure services
az postgres server firewall-rule create \
  --resource-group partify-rg \
  --server-name partify-postgres \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Post-Deployment

### 1. Initialize Database
```bash
# Run migrations
az webapp ssh --name partify-backend --resource-group partify-rg
npm run migrate
```

### 2. Set Up Custom Domain
```bash
az webapp config hostname add \
  --resource-group partify-rg \
  --webapp-name partify-backend \
  --hostname api.yourdomain.com
```

### 3. Configure SSL/TLS
```bash
# Managed certificate (automatic)
az webapp config ssl bind \
  --resource-group partify-rg \
  --name partify-backend \
  --certificate-thumbprint {thumbprint} \
  --ssl-type SNI
```

## Useful Commands Reference

```bash
# List all resources
az resource list --resource-group partify-rg --output table

# Check deployment status
az deployment group show --name partify-deployment --resource-group partify-rg

# Clean up (DELETE ALL RESOURCES)
az group delete --name partify-rg --yes --no-wait

# Export ARM template
az group export --name partify-rg > template.json
```

## Support

- [Azure Documentation](https://docs.microsoft.com/azure)
- [App Service Documentation](https://docs.microsoft.com/azure/app-service)
- [PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql)
- [Container Registry Documentation](https://docs.microsoft.com/azure/container-registry)
