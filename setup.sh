#!/bin/bash

# Partify Quick Start Script
# This script sets up the entire project with all dependencies

set -e

echo "🚀 Partify E-Commerce Platform - Quick Start"
echo "=============================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✓ npm $(npm --version) found"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
npm install
echo "✓ Backend dependencies installed"
cd ..

# Admin Portal setup
echo "📦 Setting up Admin Portal..."
cd admin-portal
npm install
echo "✓ Admin Portal dependencies installed"
cd ..

# Vendor Portal setup
echo "📦 Setting up Vendor Portal..."
cd vendor-portal
npm install
echo "✓ Vendor Portal dependencies installed"
cd ..

# Customer Portal setup
echo "📦 Setting up Customer Portal..."
cd customer-portal
npm install
echo "✓ Customer Portal dependencies installed"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Update .env.local with your Azure Storage credentials"
echo "3. Run the database schema in Supabase SQL editor"
echo ""
echo "🏃 To start development:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd admin-portal && npm run dev"
echo "   Terminal 3: cd vendor-portal && npm run dev"
echo "   Terminal 4: cd customer-portal && npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "   Admin: http://localhost:3000"
echo "   Vendor: http://localhost:3001"
echo "   Customer: http://localhost:3002"
echo "   Backend API: http://localhost:8080"

