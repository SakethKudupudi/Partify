param location string = resourceGroup().location
param environment string = 'dev'
param projectName string = 'partify'

// Storage for container images
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: '${projectName}${environment}acr'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// App Service Plan for backend
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${projectName}-${environment}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Backend Web App
resource backendWebApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${projectName}-backend-${environment}'
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appCommandLine: 'npm start'
      appSettings: [
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'SUPABASE_URL'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/supabase-url/)'
        }
        {
          name: 'SUPABASE_SERVICE_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/supabase-service-key/)'
        }
        {
          name: 'MISTRAL_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/mistral-api-key/)'
        }
        {
          name: 'JWT_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/jwt-secret/)'
        }
      ]
    }
  }
}

// Frontend Static Web App
resource frontendStaticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${projectName}-frontend-${environment}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'unified-portal'
      appBuildCommand: 'npm run build'
      outputLocation: 'dist'
    }
  }
}

// PostgreSQL Database
resource postgresqlServer 'Microsoft.DBforPostgreSQL/servers@2017-12-01' = {
  name: '${projectName}-${environment}-postgres'
  location: location
  sku: {
    name: 'B_Gen5_1'
    tier: 'Basic'
    capacity: 1
    family: 'Gen5'
  }
  properties: {
    createMode: 'Default'
    administratorLogin: 'postgresadmin'
    administratorLoginPassword: keyVault.listSecrets().value[0].value
    version: '11'
    storageMB: 51200
    backupRetentionDays: 7
    sslEnforcement: 'ENABLED'
  }
}

// PostgreSQL Database
resource postgresqlDatabase 'Microsoft.DBforPostgreSQL/servers/databases@2017-12-01' = {
  parent: postgresqlServer
  name: '${projectName}_db'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Redis Cache
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: '${projectName}-${environment}-redis'
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${projectName}-${environment}-kv'
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enableRbacAuthorization: false
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: backendWebApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

// Outputs
output backendUrl string = 'https://${backendWebApp.properties.defaultHostName}'
output frontendUrl string = 'https://${frontendStaticWebApp.properties.defaultHostName}'
output containerRegistryUrl string = containerRegistry.properties.loginServer
output keyVaultUrl string = keyVault.properties.vaultUri
