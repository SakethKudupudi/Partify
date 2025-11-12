import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';

// Dashboard
import VendorDashboard from './pages/dashboard/Dashboard';
import VendorProfile from './pages/dashboard/Profile';

// Inventory
import InventoryOverview from './pages/inventory/Overview';
import InventoryList from './pages/inventory/List';
import InventoryAdd from './pages/inventory/Add';
import InventoryEdit from './pages/inventory/Edit';
import LowStockAlerts from './pages/inventory/LowStockAlerts';

// Pricing
import PricingDashboard from './pages/pricing/Dashboard';
import PriceEdit from './pages/pricing/Edit';

// Requests
import RequestsList from './pages/requests/List';
import RequestDetails from './pages/requests/Details';

// Sales & Analytics
import SalesDashboard from './pages/sales/Dashboard';
import SalesOverview from './pages/sales/Overview';
import SalesAnalytics from './pages/sales/Analytics';
import RevenueTracking from './pages/sales/Revenue';

// Orders
import OrdersList from './pages/orders/List';
import OrderDetails from './pages/orders/Details';

// Customers
import CustomersList from './pages/customers/List';
import CustomerDetails from './pages/customers/Details';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'vendor') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/vendor" element={<ProtectedRoute><Layout><VendorDashboard /></Layout></ProtectedRoute>} />
          <Route path="/vendor/overview" element={<ProtectedRoute><Layout><VendorDashboard /></Layout></ProtectedRoute>} />
          <Route path="/vendor/profile" element={<ProtectedRoute><Layout><VendorProfile /></Layout></ProtectedRoute>} />

          {/* Inventory */}
          <Route path="/vendor/inventory" element={<ProtectedRoute><Layout><InventoryOverview /></Layout></ProtectedRoute>} />
          <Route path="/vendor/inventory/all" element={<ProtectedRoute><Layout><InventoryList /></Layout></ProtectedRoute>} />
          <Route path="/vendor/inventory/add" element={<ProtectedRoute><Layout><InventoryAdd /></Layout></ProtectedRoute>} />
          <Route path="/vendor/inventory/:id/edit" element={<ProtectedRoute><Layout><InventoryEdit /></Layout></ProtectedRoute>} />
          <Route path="/vendor/inventory/low-stock" element={<ProtectedRoute><Layout><LowStockAlerts /></Layout></ProtectedRoute>} />

          {/* Pricing */}
          <Route path="/vendor/pricing" element={<ProtectedRoute><Layout><PricingDashboard /></Layout></ProtectedRoute>} />
          <Route path="/vendor/pricing/:id/edit" element={<ProtectedRoute><Layout><PriceEdit /></Layout></ProtectedRoute>} />

          {/* Requests */}
          <Route path="/vendor/requests" element={<ProtectedRoute><Layout><RequestsList /></Layout></ProtectedRoute>} />
          <Route path="/vendor/requests/:id" element={<ProtectedRoute><Layout><RequestDetails /></Layout></ProtectedRoute>} />

          {/* Sales & Analytics */}
          <Route path="/vendor/sales" element={<ProtectedRoute><Layout><SalesDashboard /></Layout></ProtectedRoute>} />
          <Route path="/vendor/sales/overview" element={<ProtectedRoute><Layout><SalesOverview /></Layout></ProtectedRoute>} />
          <Route path="/vendor/sales/analytics" element={<ProtectedRoute><Layout><SalesAnalytics /></Layout></ProtectedRoute>} />
          <Route path="/vendor/sales/revenue" element={<ProtectedRoute><Layout><RevenueTracking /></Layout></ProtectedRoute>} />

          {/* Orders */}
          <Route path="/vendor/orders" element={<ProtectedRoute><Layout><OrdersList /></Layout></ProtectedRoute>} />
          <Route path="/vendor/orders/:id" element={<ProtectedRoute><Layout><OrderDetails /></Layout></ProtectedRoute>} />

          {/* Customers */}
          <Route path="/vendor/customers" element={<ProtectedRoute><Layout><CustomersList /></Layout></ProtectedRoute>} />
          <Route path="/vendor/customers/:id" element={<ProtectedRoute><Layout><CustomerDetails /></Layout></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/vendor" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

