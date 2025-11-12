#!/bin/bash
# Create all necessary directories
mkdir -p src/pages/{admin,vendor,customer}/{brands,models,components,vendors,inventory,pricing,requests,sales,orders,account,shopping}
# Create placeholder component template
create_page() {
  local path=$1
  local name=$2
  cat > "$path" << 'COMPONENT'
import React from 'react';
export default function Component() {
  return (
    <div className="section">
      <div className="section-title">
        <h2>Page Component</h2>
      </div>
      <div className="card">
        <p>Component loaded successfully</p>
      </div>
    </div>
  );
}
COMPONENT
}
# Admin Pages
create_page "src/pages/admin/Dashboard.jsx" "Dashboard"
create_page "src/pages/admin/brands/BrandsList.jsx" "Brands"
create_page "src/pages/admin/models/ModelsList.jsx" "Models"
create_page "src/pages/admin/components/ComponentsList.jsx" "Components"
create_page "src/pages/admin/vendors/VendorsList.jsx" "Vendors"
create_page "src/pages/admin/vendors/VendorRequests.jsx" "Requests"
create_page "src/pages/admin/sales/SalesDashboard.jsx" "Sales"
create_page "src/pages/admin/orders/OrdersList.jsx" "Orders"
# Vendor Pages
create_page "src/pages/vendor/Dashboard.jsx" "Dashboard"
create_page "src/pages/vendor/inventory/Overview.jsx" "Inventory"
create_page "src/pages/vendor/pricing/Dashboard.jsx" "Pricing"
create_page "src/pages/vendor/requests/List.jsx" "Requests"
create_page "src/pages/vendor/sales/Dashboard.jsx" "Sales"
create_page "src/pages/vendor/orders/List.jsx" "Orders"
# Customer Pages
create_page "src/pages/customer/HomePage.jsx" "Home"
create_page "src/pages/customer/brands/BrandsList.jsx" "Brands"
create_page "src/pages/customer/shopping/Cart.jsx" "Cart"
create_page "src/pages/customer/shopping/Checkout.jsx" "Checkout"
create_page "src/pages/customer/orders/Orders.jsx" "Orders"
create_page "src/pages/customer/account/Account.jsx" "Account"
echo "✅ All placeholder pages created!"
