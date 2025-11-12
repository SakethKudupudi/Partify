#!/bin/bash

# Terraform Azure Setup Script for Partify E-Commerce

set -e

echo "🚀 Partify E-Commerce - Azure Terraform Setup"
echo "=============================================="

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform not found. Please install Terraform first."
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install Azure CLI first."
    exit 1
fi

# Navigate to terraform directory
cd "$(dirname "$0")"

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init

# Validate configuration
echo "✓ Validating Terraform configuration..."
terraform validate

# Plan deployment
echo "📋 Planning deployment..."
terraform plan -out=tfplan

# Ask for confirmation
read -p "Do you want to apply these changes? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Apply configuration
echo "⚙️  Applying Terraform configuration..."
terraform apply tfplan

# Save outputs
echo "💾 Saving outputs..."
terraform output -json > ../azure-outputs.json

echo ""
echo "✅ Deployment complete!"
echo "📄 Check ../azure-outputs.json for resource URLs and credentials"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with the Azure credentials"
echo "2. Deploy the backend to the App Service"
echo "3. Deploy the frontend portals"

