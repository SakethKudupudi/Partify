import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalInventory: 0,
    pendingRequests: 0,
    approvedItems: 0,
    totalSales: 0,
    revenue: 0,
    lowStock: 0
  });
  const [recentInventory, setRecentInventory] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/vendor';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch inventory stats
      const inventoryRes = await fetch(`${API_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (inventoryRes.ok) {
        const inventory = await inventoryRes.json();
        const approved = inventory.filter(item => item.status === 'approved');
        const lowStock = inventory.filter(item => item.quantity < 10);
        
        setStats(prev => ({
          ...prev,
          totalInventory: inventory.length,
          approvedItems: approved.length,
          lowStock: lowStock.length
        }));
        
        setRecentInventory(inventory.slice(0, 5));
      }

      // Fetch requests
      const requestsRes = await fetch(`${API_URL}/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (requestsRes.ok) {
        const requests = await requestsRes.json();
        const pending = requests.filter(r => r.status === 'pending');
        
        setStats(prev => ({
          ...prev,
          pendingRequests: pending.length
        }));
        
        setRecentRequests(requests.slice(0, 5));
      }

    } catch (error) {
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        <h2>Vendor Dashboard</h2>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          Welcome back! Here's your business overview
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ fontSize: '36px', color: '#0066cc', marginBottom: '8px' }}>
            {stats.totalInventory}
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>Total Inventory Items</p>
          <Link to="/vendor/inventory" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            View All
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ fontSize: '36px', color: '#34c759', marginBottom: '8px' }}>
            {stats.approvedItems}
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>Approved Items</p>
          <Link to="/vendor/inventory" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            Manage
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ fontSize: '36px', color: '#ff9500', marginBottom: '8px' }}>
            {stats.pendingRequests}
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>Pending Requests</p>
          <Link to="/vendor/requests" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            Review
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <h3 style={{ fontSize: '36px', color: '#ff3b30', marginBottom: '8px' }}>
            {stats.lowStock}
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>Low Stock Items</p>
          <Link to="/vendor/inventory/low-stock" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            Restock
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Link to="/vendor/inventory/add" className="btn btn-primary">
            + Add Inventory
          </Link>
          <Link to="/vendor/brands" className="btn btn-secondary">
            Browse Models
          </Link>
          <Link to="/vendor/requests/create" className="btn btn-secondary">
            Submit Request
          </Link>
          <Link to="/vendor/pricing" className="btn btn-secondary">
            Update Pricing
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Inventory */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px' }}>Recent Inventory</h3>
            <Link to="/vendor/inventory" style={{ fontSize: '14px', color: '#0066cc' }}>
              View All →
            </Link>
          </div>

          {recentInventory.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No inventory items yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentInventory.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f7',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      {item.component_name || 'Component'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Qty: {item.quantity} • ${item.price}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: item.status === 'approved' ? '#34c759' : 
                                   item.status === 'pending' ? '#ff9500' : '#ff3b30',
                    color: 'white'
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px' }}>Recent Requests</h3>
            <Link to="/vendor/requests" style={{ fontSize: '14px', color: '#0066cc' }}>
              View All →
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No requests yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentRequests.map(request => (
                <div
                  key={request.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f7',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      {request.request_type || 'Request'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: request.status === 'approved' ? '#34c759' :
                                   request.status === 'pending' ? '#ff9500' : '#ff3b30',
                    color: 'white'
                  }}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
