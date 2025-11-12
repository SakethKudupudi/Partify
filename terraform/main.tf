# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.project}-rg-${local.environment}"
  location = local.location
}

# Storage Account for Blob Storage (images, files)
resource "azurerm_storage_account" "main" {
  name                     = "${local.project}storage${replace(local.environment, "-", "")}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = var.storage_account_tier
  account_replication_type = var.storage_account_replication_type

  tags = {
    environment = local.environment
    project     = local.project
  }
}

# Storage Container for product images
resource "azurerm_storage_container" "product_images" {
  name                  = "product-images"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Storage Container for phone model images
resource "azurerm_storage_container" "phone_models" {
  name                  = "phone-models"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Storage Container for brand logos
resource "azurerm_storage_container" "brands" {
  name                  = "brands"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Redis Cache for shopping cart
resource "azurerm_redis_cache" "main" {
  name                = "${local.project}-redis-${local.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = var.redis_capacity
  family              = var.redis_family
  sku_name            = var.redis_sku_name
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_policy = "allkeys-lru"
  }

  tags = {
    environment = local.environment
    project     = local.project
  }
}

# App Service Plan for Backend
resource "azurerm_service_plan" "main" {
  name                = "${local.project}-asp-${local.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = {
    environment = local.environment
    project     = local.project
  }
}

# App Service for Backend API
resource "azurerm_linux_web_app" "backend" {
  name                = "${local.project}-backend-${local.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on                = true
    use_32_bit_worker_process = false

    application_stack {
      node_version = "18-lts"
    }

    cors {
      allowed_origins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
    }
  }

  app_settings = {
    PORT                          = "8080"
    NODE_ENV                      = "production"
    AZURE_STORAGE_ACCOUNT_KEY    = azurerm_storage_account.main.primary_connection_string
    REDIS_HOST                    = azurerm_redis_cache.main.hostname
    REDIS_PORT                    = azurerm_redis_cache.main.port
    AZURE_REDIS_PASSWORD          = azurerm_redis_cache.main.primary_access_key
  }

  tags = {
    environment = local.environment
    project     = local.project
  }
}

# App Service for Admin Portal
resource "azurerm_linux_web_app" "admin_portal" {
  name                = "${local.project}-admin-${local.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on                = true
    use_32_bit_worker_process = false

    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    VITE_API_URL = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }

  tags = {
    environment = local.environment
    project     = local.project
  }
}

# App Service for Customer Portal
resource "azurerm_linux_web_app" "customer_portal" {
  name                = "${local.project}-customer-${local.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on                = true
    use_32_bit_worker_process = false

    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    VITE_API_URL = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }

  tags = {
    environment = local.environment
    project     = local.project
  }
}

# App Service for Vendor Portal
resource "azurerm_linux_web_app" "vendor_portal" {
  name                = "${local.project}-vendor-${local.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on                = true
    use_32_bit_worker_process = false

    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    VITE_API_URL = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }

  tags = {
    environment = local.environment
    project     = local.project
  }
}

