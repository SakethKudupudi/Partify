import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    brands: 0,
    models: 0,
    vendors: 0,
    orders: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch brands count
      const brandsRes = await fetch(`${API_URL}/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const brands = brandsRes.ok ? await brandsRes.json() : [];

      // Fetch models count
      const modelsRes = await fetch(`${API_URL}/models`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const models = modelsRes.ok ? await modelsRes.json() : [];

      // Fetch vendors count
      const vendorsRes = await fetch(`${API_URL}/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vendors = vendorsRes.ok ? await vendorsRes.json() : [];

      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

      setStats({
        brands: brands.length,
        models: models.length,
        vendors: vendors.length,
        orders: orders.length,
        revenue: totalRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, link, color = '#0066cc' }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div className="card" style={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
          transform: 'translateY(-4px)'
        }
      }}>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
        <h2 style={{ color, fontSize: '36px', marginBottom: '0' }}>
          {loading ? '...' : value}
        </h2>
      </div>
    </Link>
  );

  return (
    <div className="section">
      <div className="section-title">
        <h2>Admin Dashboard</h2>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Brands"
          value={stats.brands}
          link="/admin/brands"
          color="#0066cc"
        />
        <StatCard
          title="Phone Models"
          value={stats.models}
          link="/admin/brands/models"
          color="#34c759"
        />
        <StatCard
          title="Active Vendors"
          value={stats.vendors}
          link="/admin/vendors"
          color="#ff9500"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          link="/admin/orders"
          color="#5856d6"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          link="/admin/sales"
          color="#ff3b30"
        />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Link to="/admin/brands">
            <button className="btn btn-primary" style={{ width: '100%' }}>
              📱 Manage Brands
            </button>
          </Link>
          <Link to="/admin/brands/models">
            <button className="btn btn-primary" style={{ width: '100%' }}>
              🔧 Manage Models
            </button>
          </Link>
          <Link to="/admin/components">
            <button className="btn btn-primary" style={{ width: '100%' }}>
              ⚙️ Manage Components
            </button>
          </Link>
          <Link to="/admin/vendors">
            <button className="btn btn-primary" style={{ width: '100%' }}>
              🏪 View Vendors
            </button>
          </Link>
          <Link to="/admin/orders">
            <button className="btn btn-primary" style={{ width: '100%' }}>
              📦 View Orders
            </button>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>System Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Database</span>
            <span style={{ 
              padding: '4px 12px', 
              backgroundColor: '#34c759', 
              color: 'white', 
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Connected
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Authentication</span>
            <span style={{ 
              padding: '4px 12px', 
              backgroundColor: '#34c759', 
              color: 'white', 
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Active
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Storage</span>
            <span style={{ 
              padding: '4px 12px', 
              backgroundColor: '#34c759', 
              color: 'white', 
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

