import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation({ role = 'customer' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (role === 'customer') {
      fetchCartCount();
    }
  }, [role]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:8080/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin' },
          { label: 'Brands', path: '/admin/brands' },
          { label: 'Models', path: '/admin/models' },
          { label: 'Components', path: '/admin/components' },
          { label: 'Vendors', path: '/admin/vendors' },
          { label: 'Requests', path: '/admin/requests' },
          { label: 'Sales', path: '/admin/sales' },
          { label: 'Orders', path: '/admin/orders' },
        ];
      case 'vendor':
        return [
          { label: 'Dashboard', path: '/vendor' },
          { label: 'Inventory', path: '/vendor/inventory' },
          { label: 'Pricing', path: '/vendor/pricing' },
          { label: 'Requests', path: '/vendor/requests' },
          { label: 'Sales', path: '/vendor/sales' },
          { label: 'Orders', path: '/vendor/orders' },
        ];
      case 'customer':
      default:
        return [
          { label: 'Home', path: '/' },
          { label: 'Brands', path: '/brands' },
          { label: 'Cart', path: '/cart' },
          { label: 'Orders', path: '/orders' },
          { label: 'Account', path: '/account' },
        ];
    }
  };

  const navItems = getNavItems();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href={role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/'} className="navbar-logo">
          Partify
          <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
            ({role.charAt(0).toUpperCase() + role.slice(1)})
          </span>
        </a>

        <ul className="navbar-menu">
          {navItems.map(item => (
            <li key={item.path}>
              <a
                href={item.path}
                style={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  color: location.pathname === item.path ? '#0071e3' : '#000',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {item.label}
                {item.label === 'Cart' && cartCount > 0 && (
                  <span style={{
                    backgroundColor: '#ff3b30',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <span style={{ marginRight: '16px', fontSize: '13px' }}>
            {user.name || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

