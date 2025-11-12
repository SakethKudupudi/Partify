import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import BrandsList from './pages/brands/BrandsList';
import BrandDetails from './pages/brands/BrandDetails';
import PhoneModels from './pages/phone/PhoneModels';
import PhoneModelDetails from './pages/phone/PhoneModelDetails';
import ComponentDetails from './pages/components/ComponentDetails';
import SearchResults from './pages/SearchResults';
import Categories from './pages/Categories';

// Shopping
import Cart from './pages/shopping/Cart';
import Checkout from './pages/shopping/Checkout';
import CheckoutShipping from './pages/shopping/CheckoutShipping';
import CheckoutPayment from './pages/shopping/CheckoutPayment';
import OrderConfirmation from './pages/shopping/OrderConfirmation';

// Account
import Account from './pages/account/Account';
import Profile from './pages/account/Profile';
import Addresses from './pages/account/Addresses';
import PaymentMethods from './pages/account/PaymentMethods';
import Wishlist from './pages/account/Wishlist';

// Orders
import Orders from './pages/orders/Orders';
import OrderDetails from './pages/orders/OrderDetails';
import OrderTracking from './pages/orders/OrderTracking';
import OrderInvoice from './pages/orders/OrderInvoice';

// Support
import Support from './pages/support/Support';
import Contact from './pages/support/Contact';
import FAQ from './pages/support/FAQ';
import TrackOrder from './pages/support/TrackOrder';
import About from './pages/support/About';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Home & Browse */}
          <Route path="/" element={<HomePage />} />
          <Route path="/brands" element={<BrandsList />} />
          <Route path="/brands/:brandId" element={<BrandDetails />} />
          <Route path="/brands/:brandId/models" element={<PhoneModels />} />

          {/* Products */}
          <Route path="/models/:modelId" element={<PhoneModelDetails />} />
          <Route path="/models/:modelId/components" element={<ComponentDetails />} />
          <Route path="/components/:componentId" element={<ComponentDetails />} />
          <Route path="/components/:componentId/vendors" element={<ComponentDetails />} />

          {/* Search & Categories */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryName" element={<ComponentDetails />} />

          {/* Shopping */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/shipping" element={<ProtectedRoute><CheckoutShipping /></ProtectedRoute>} />
          <Route path="/checkout/payment" element={<ProtectedRoute><CheckoutPayment /></ProtectedRoute>} />
          <Route path="/checkout/review" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/confirm" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

          {/* Orders */}
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/orders/:orderId/track" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/orders/:orderId/invoice" element={<ProtectedRoute><OrderInvoice /></ProtectedRoute>} />

          {/* Account */}
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/account/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
          <Route path="/account/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

          {/* Support */}
          <Route path="/support" element={<Support />} />
          <Route path="/support/contact" element={<Contact />} />
          <Route path="/support/faq" element={<FAQ />} />
          <Route path="/support/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

