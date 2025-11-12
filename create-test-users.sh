#!/bin/bash

# ==========================================
# PARTIFY - Create Test Users in Supabase
# ==========================================
# This script creates test users via API
# Run from project root: ./create-test-users.sh

echo "🚀 Creating Partify Test Users in Supabase..."
echo ""

# Backend URL
BACKEND_URL="http://localhost:8080"

# ==========================================
# 1. Create Admin User
# ==========================================
echo "📝 Creating Admin User..."
curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@partify.com",
    "password": "Admin@123456",
    "name": "Admin User",
    "role": "admin"
  }'
echo ""
echo ""

# ==========================================
# 2. Create Vendor User
# ==========================================
echo "📝 Creating Vendor User..."
curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@store.com",
    "password": "Vendor@123456",
    "name": "Vendor Store",
    "role": "vendor",
    "store_name": "Tech Components Store"
  }'
echo ""
echo ""

# ==========================================
# 3. Create Customer User
# ==========================================
echo "📝 Creating Customer User..."
curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@email.com",
    "password": "Customer@123456",
    "name": "John Customer",
    "role": "customer"
  }'
echo ""
echo ""

echo "✅ Done! Test users created successfully."
echo ""
echo "Test Credentials:"
echo "=================="
echo "Admin:    admin@partify.com / Admin@123456"
echo "Vendor:   vendor@store.com / Vendor@123456"
echo "Customer: customer@email.com / Customer@123456"
echo ""
echo "You can now login at: http://localhost:3000/login"
