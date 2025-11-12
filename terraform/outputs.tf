output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Name of the resource group"
}

output "storage_account_name" {
  value       = azurerm_storage_account.main.name
  description = "Name of the storage account"
}

output "storage_account_connection_string" {
  value       = azurerm_storage_account.main.primary_connection_string
  sensitive   = true
  description = "Connection string for storage account"
}

output "redis_hostname" {
  value       = azurerm_redis_cache.main.hostname
  description = "Redis cache hostname"
}

output "redis_port" {
  value       = azurerm_redis_cache.main.port
  description = "Redis cache port"
}

output "redis_access_key" {
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
  description = "Redis cache primary access key"
}

output "backend_api_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "Backend API URL"
}

output "admin_portal_url" {
  value       = "https://${azurerm_linux_web_app.admin_portal.default_hostname}"
  description = "Admin portal URL"
}

output "customer_portal_url" {
  value       = "https://${azurerm_linux_web_app.customer_portal.default_hostname}"
  description = "Customer portal URL"
}

output "vendor_portal_url" {
  value       = "https://${azurerm_linux_web_app.vendor_portal.default_hostname}"
  description = "Vendor portal URL"
}

