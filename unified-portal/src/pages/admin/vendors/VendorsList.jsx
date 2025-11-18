import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        toast.error('Failed to fetch vendors');
      }
    } catch (error) {
      toast.error('Error fetching vendors');
    } finally {
      setLoading(false);
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this vendor?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Vendor ${action}d successfully`);
        fetchVendors();
      } else {
        toast.error(`Failed to ${action} vendor`);
      }
    } catch (error) {
      toast.error('Error updating vendor status');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && vendor.is_active) ||
                         (filterActive === 'inactive' && !vendor.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="section">
        <div className="section-title">
          <h2>Vendors Management</h2>
        </div>
        <div className="card">
          <p>Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        <h2>Vendors Management</h2>
        <p>Manage vendor accounts and their status</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '250px', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="all">All Vendors</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Vendors List */}
      <div className="card">
        {filteredVendors.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No vendors found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Store Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Total Sales</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{vendor.store_name}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>{vendor.email || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{vendor.phone || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: vendor.is_active ? '#d4edda' : '#f8d7da',
                        color: vendor.is_active ? '#155724' : '#721c24'
                      }}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {vendor.total_sales || 0}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleVendorStatus(vendor.id, vendor.is_active)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '5px',
                          border: 'none',
                          backgroundColor: vendor.is_active ? '#dc3545' : '#28a745',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {vendor.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#007bff' }}>{vendors.length}</h3>
          <p style={{ margin: 0, color: '#666' }}>Total Vendors</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#28a745' }}>
            {vendors.filter(v => v.is_active).length}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Active Vendors</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#dc3545' }}>
            {vendors.filter(v => !v.is_active).length}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>Inactive Vendors</p>
        </div>
      </div>
    </div>
  );
}
