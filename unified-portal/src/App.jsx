import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Common Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminBrands from './pages/admin/brands/BrandsList';
import AdminModelsManagement from './pages/admin/brands/ModelsManagement';
import AdminModels from './pages/admin/models/ModelsList';
import AdminComponents from './pages/admin/components/ComponentsList';
import AdminVendors from './pages/admin/vendors/VendorsList';
import AdminVendorRequests from './pages/admin/requests/VendorRequests';
import AdminSales from './pages/admin/sales/SalesDashboard';
import AdminOrders from './pages/admin/orders/OrdersList';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorBrandsView from './pages/vendor/BrandsView';
import VendorInventory from './pages/vendor/inventory/Inventory';
import VendorPricing from './pages/vendor/pricing/Dashboard';
import VendorRequests from './pages/vendor/requests/List';
import VendorSales from './pages/vendor/sales/Dashboard';
import VendorOrders from './pages/vendor/orders/List';

// Customer Pages
import CustomerHome from './pages/customer/HomePage';
import CustomerBrands from './pages/customer/Brands';
import CustomerBrandModels from './pages/customer/BrandModels';
import CustomerModelDetails from './pages/customer/ModelDetails';
import CustomerCart from './pages/customer/shopping/Cart';
import CustomerCheckout from './pages/customer/shopping/Checkout';
import CustomerOrders from './pages/customer/orders/Orders';
import CustomerAccount from './pages/customer/account/Account';

// Auth Pages
import Login from './pages/Login';

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* ============================================ */}
          {/* ADMIN PORTAL - /admin/* */}
          {/* ============================================ */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <Navigation role="admin" />
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="overview" element={<AdminDashboard />} />

                  {/* Brands */}
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="brands/models" element={<AdminModelsManagement />} />
                  <Route path="brands/add" element={<AdminBrands />} />
                  <Route path="brands/:id" element={<AdminBrands />} />
                  <Route path="brands/:id/edit" element={<AdminBrands />} />
                  <Route path="brands/:id/models" element={<AdminModelsManagement />} />

                  {/* Models */}
                  <Route path="models" element={<AdminModelsManagement />} />
                  <Route path="models/add" element={<AdminModels />} />
                  <Route path="models/:id" element={<AdminModels />} />
                  <Route path="models/:id/edit" element={<AdminModels />} />
                  <Route path="models/:id/components" element={<AdminModels />} />
                  <Route path="models/bulk-upload" element={<AdminModels />} />

                  {/* Components */}
                  <Route path="components" element={<AdminComponents />} />
                  <Route path="components/add" element={<AdminComponents />} />
                  <Route path="components/:id" element={<AdminComponents />} />
                  <Route path="components/:id/edit" element={<AdminComponents />} />
                  <Route path="components/:id/inventory" element={<AdminComponents />} />
                  <Route path="components/categories" element={<AdminComponents />} />
                  <Route path="components/bulk-upload" element={<AdminComponents />} />

                  {/* Vendors */}
                  <Route path="vendors" element={<AdminVendors />} />
                  <Route path="vendors/:id" element={<AdminVendors />} />
                  <Route path="vendors/:id/inventory" element={<AdminVendors />} />
                  <Route path="vendors/:id/sales" element={<AdminVendors />} />
                  <Route path="vendors/:id/suspend" element={<AdminVendors />} />
                  <Route path="vendors/performance" element={<AdminVendors />} />
                  
                  {/* Vendor Requests */}
                  <Route path="vendors/requests" element={<AdminVendorRequests />} />
                  <Route path="vendors/requests/pending" element={<AdminVendorRequests />} />
                  <Route path="vendors/requests/approved" element={<AdminVendorRequests />} />
                  <Route path="vendors/requests/rejected" element={<AdminVendorRequests />} />
                  <Route path="vendors/requests/:id" element={<AdminVendorRequests />} />
                  <Route path="vendors/requests/:id/approve" element={<AdminVendorRequests />} />
                  <Route path="vendors/requests/:id/reject" element={<AdminVendorRequests />} />

                  {/* Sales */}
                  <Route path="sales" element={<AdminSales />} />
                  <Route path="sales/overview" element={<AdminSales />} />
                  <Route path="sales/reports" element={<AdminSales />} />
                  <Route path="sales/reports/daily" element={<AdminSales />} />
                  <Route path="sales/reports/weekly" element={<AdminSales />} />
                  <Route path="sales/reports/monthly" element={<AdminSales />} />
                  <Route path="sales/reports/custom" element={<AdminSales />} />
                  <Route path="sales/analytics" element={<AdminSales />} />
                  <Route path="sales/analytics/trends" element={<AdminSales />} />
                  <Route path="sales/analytics/products" element={<AdminSales />} />
                  <Route path="sales/analytics/brands" element={<AdminSales />} />
                  <Route path="sales/analytics/vendors" element={<AdminSales />} />
                  <Route path="sales/revenue" element={<AdminSales />} />
                  <Route path="sales/commissions" element={<AdminSales />} />
                  <Route path="sales/commissions/calculate" element={<AdminSales />} />
                  <Route path="sales/commissions/payouts" element={<AdminSales />} />

                  {/* Orders */}
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrders />} />
                  <Route path="orders/pending" element={<AdminOrders />} />
                  <Route path="orders/completed" element={<AdminOrders />} />
                  <Route path="orders/cancelled" element={<AdminOrders />} />
                  <Route path="orders/refunds" element={<AdminOrders />} />

                  {/* Settings */}
                  <Route path="settings" element={<AdminDashboard />} />
                  <Route path="settings/pricing" element={<AdminDashboard />} />
                  <Route path="settings/shipping" element={<AdminDashboard />} />
                  <Route path="settings/notifications" element={<AdminDashboard />} />

                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* VENDOR PORTAL - /vendor/* */}
          {/* ============================================ */}
          <Route
            path="/vendor/*"
            element={
              <ProtectedRoute requiredRole="vendor">
                <Navigation role="vendor" />
                <Routes>
                  <Route path="/" element={<VendorDashboard />} />
                  <Route path="dashboard" element={<VendorDashboard />} />
                  <Route path="overview" element={<VendorDashboard />} />
                  <Route path="profile" element={<VendorDashboard />} />

                  {/* Brands & Models View */}
                  <Route path="brands" element={<VendorBrandsView />} />
                  <Route path="brands/:brandId/models" element={<VendorBrandsView />} />

                  {/* Inventory */}
                  <Route path="inventory" element={<VendorInventory />} />
                  <Route path="inventory/all" element={<VendorInventory />} />
                  <Route path="inventory/add" element={<VendorInventory />} />
                  <Route path="inventory/add/brand" element={<VendorInventory />} />
                  <Route path="inventory/add/model" element={<VendorInventory />} />
                  <Route path="inventory/add/component" element={<VendorInventory />} />
                  <Route path="inventory/:id" element={<VendorInventory />} />
                  <Route path="inventory/:id/edit" element={<VendorInventory />} />
                  <Route path="inventory/:id/restock" element={<VendorInventory />} />
                  <Route path="inventory/low-stock" element={<VendorInventory />} />
                  <Route path="inventory/out-of-stock" element={<VendorInventory />} />
                  <Route path="inventory/bulk-update" element={<VendorInventory />} />

                  {/* Pricing */}
                  <Route path="pricing" element={<VendorPricing />} />
                  <Route path="pricing/:id/edit" element={<VendorPricing />} />
                  <Route path="pricing/bulk-edit" element={<VendorPricing />} />
                  <Route path="pricing/competitive" element={<VendorPricing />} />
                  <Route path="pricing/history" element={<VendorPricing />} />

                  {/* Requests */}
                  <Route path="requests" element={<VendorRequests />} />
                  <Route path="requests/pending" element={<VendorRequests />} />
                  <Route path="requests/approved" element={<VendorRequests />} />
                  <Route path="requests/rejected" element={<VendorRequests />} />
                  <Route path="requests/:id" element={<VendorRequests />} />
                  <Route path="requests/create" element={<VendorRequests />} />

                  {/* Sales */}
                  <Route path="sales" element={<VendorSales />} />
                  <Route path="sales/overview" element={<VendorSales />} />
                  <Route path="sales/daily" element={<VendorSales />} />
                  <Route path="sales/weekly" element={<VendorSales />} />
                  <Route path="sales/monthly" element={<VendorSales />} />
                  <Route path="sales/analytics" element={<VendorSales />} />
                  <Route path="sales/analytics/trends" element={<VendorSales />} />
                  <Route path="sales/analytics/top-products" element={<VendorSales />} />
                  <Route path="sales/reports" element={<VendorSales />} />
                  <Route path="sales/reports/generate" element={<VendorSales />} />
                  <Route path="sales/revenue" element={<VendorSales />} />
                  <Route path="sales/earnings" element={<VendorSales />} />
                  <Route path="sales/payouts" element={<VendorSales />} />

                  {/* Orders */}
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="orders/:id" element={<VendorOrders />} />
                  <Route path="orders/pending" element={<VendorOrders />} />
                  <Route path="orders/processing" element={<VendorOrders />} />
                  <Route path="orders/shipped" element={<VendorOrders />} />
                  <Route path="orders/delivered" element={<VendorOrders />} />
                  <Route path="orders/cancelled" element={<VendorOrders />} />

                  <Route path="*" element={<Navigate to="/vendor" replace />} />
                </Routes>
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* CUSTOMER PORTAL - /* (root paths) */}
          {/* ============================================ */}
          <Route
            path="/*"
            element={
              <>
                <Navigation role="customer" />
                <Routes>
                  <Route path="/" element={<CustomerHome />} />
                  
                  {/* Brands & Products */}
                  <Route path="brands" element={<CustomerBrands />} />
                  <Route path="brands/:brandId" element={<CustomerBrandModels />} />
                  <Route path="brands/:brandId/models" element={<CustomerBrandModels />} />
                  <Route path="models/:modelId" element={<CustomerModelDetails />} />
                  <Route path="models/:modelId/components" element={<CustomerBrands />} />
                  <Route path="components/:componentId" element={<CustomerBrands />} />
                  <Route path="components/:componentId/vendors" element={<CustomerBrands />} />
                  
                  {/* Search & Categories */}
                  <Route path="search" element={<CustomerBrands />} />
                  <Route path="categories" element={<CustomerBrands />} />
                  <Route path="categories/:categoryName" element={<CustomerBrands />} />

                  {/* Shopping */}
                  <Route
                    path="cart"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="cart/add/:componentId"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="checkout"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCheckout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="checkout/shipping"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCheckout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="checkout/payment"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCheckout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="checkout/review"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCheckout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="checkout/confirm"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerCheckout />
                      </ProtectedRoute>
                    }
                  />

                  {/* Orders & Account */}
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders/:orderId"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders/:orderId/track"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders/:orderId/invoice"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders/:orderId/return"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders/:orderId/review"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Account */}
                  <Route
                    path="account"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerAccount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account/profile"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerAccount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account/addresses"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerAccount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account/addresses/add"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerAccount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account/payment-methods"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerAccount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account/wishlist"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerAccount />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Support */}
                  <Route path="support" element={<CustomerHome />} />
                  <Route path="support/contact" element={<CustomerHome />} />
                  <Route path="support/faq" element={<CustomerHome />} />
                  <Route path="support/track-order" element={<CustomerHome />} />
                  <Route path="about" element={<CustomerHome />} />
                  <Route path="terms" element={<CustomerHome />} />
                  <Route path="privacy" element={<CustomerHome />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

