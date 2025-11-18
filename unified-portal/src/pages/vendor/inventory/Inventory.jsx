import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VendorInventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [components, setComponents] = useState([]);
  const [modelComponents, setModelComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [formData, setFormData] = useState({
    brand_id: '',
    phone_model_id: '',
    component_id: '',
    quantity: '',
    proposed_price: ''
  });

  const API_URL = 'http://localhost:8080/api/vendor';

  useEffect(() => {
    fetchInventory();
    fetchBrands();
  }, []);

  // Fetch models when brand is selected
  useEffect(() => {
    if (formData.brand_id) {
      fetchModels(formData.brand_id);
    }
  }, [formData.brand_id]);

  // Fetch components when model is selected
  useEffect(() => {
    if (formData.phone_model_id) {
      fetchModelComponents(formData.phone_model_id);
    }
  }, [formData.phone_model_id]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      toast.error('Error fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/customer/brands');

      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Error loading brands');
    }
  };

  const fetchModels = async (brandId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/customer/brands/${brandId}/models`);

      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Error loading models');
    }
  };

  const fetchModelComponents = async (modelId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/customer/models/${modelId}/components`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setModelComponents(data);
      }
    } catch (error) {
      console.error('Error fetching components');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingItem
        ? `${API_URL}/inventory/${editingItem.id}`
        : `${API_URL}/inventory`;
      
      const method = editingItem ? 'PUT' : 'POST';

      // Prepare the request body
      const requestBody = editingItem 
        ? {
            quantity: parseInt(formData.quantity),
            proposed_price: parseFloat(formData.proposed_price)
          }
        : {
            phone_model_id: formData.phone_model_id,
            component_id: formData.component_id,
            quantity: parseInt(formData.quantity),
            proposed_price: parseFloat(formData.proposed_price)
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast.success(editingItem ? 'Request updated and sent for approval!' : 'Request submitted for admin approval!');
        setShowAddModal(false);
        setEditingItem(null);
        setFormData({
          brand_id: '',
          phone_model_id: '',
          component_id: '',
          quantity: '',
          proposed_price: ''
        });
        setModels([]);
        setModelComponents([]);
        fetchInventory();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Inventory deleted!');
        fetchInventory();
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesStatus = !filterStatus || item.status === filterStatus;
    const matchesBrand = !filterBrand || item.phone_models?.brand_id === filterBrand;
    return matchesStatus && matchesBrand;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#34c759';
      case 'pending_approval': return '#ff9500';
      case 'rejected': return '#ff3b30';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending_approval': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        <h2>My Inventory</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Inventory Request
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#0066cc' }}>{inventory.length}</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Total Requests</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#34c759' }}>
            {inventory.filter(i => i.status === 'approved').length}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Approved</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#ff9500' }}>
            {inventory.filter(i => i.status === 'pending_approval').length}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Pending Approval</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#ff3b30' }}>
            {inventory.filter(i => i.status === 'rejected').length}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Status</label>
            <select
              className="form-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Brand</label>
            <select
              className="form-input"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
            {inventory.length === 0 ? 'No inventory requests yet' : 'No items match your filter'}
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Submit Your First Inventory Request
          </button>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Component</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Model</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Proposed Price</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                        {item.components?.name || 'Component'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {item.components?.category || 'N/A'}
                      </p>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                      {item.phone_models?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        backgroundColor: item.quantity < 10 ? '#fee' : '#efe',
                        color: item.quantity < 10 ? '#c00' : '#060'
                      }}>
                        {item.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>
                      ${parseFloat(item.proposed_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: getStatusColor(item.status),
                        color: 'white'
                      }}>
                        {getStatusText(item.status)}
                      </span>
                      {item.status === 'rejected' && item.rejection_reason && (
                        <p style={{ fontSize: '11px', color: '#ff3b30', marginTop: '4px' }}>
                          Reason: {item.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {item.status === 'pending_approval' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => {
                              setEditingItem(item);
                              setFormData({
                                brand_id: item.phone_models?.brand_id || '',
                                phone_model_id: item.phone_model_id,
                                component_id: item.component_id,
                                quantity: item.quantity,
                                proposed_price: item.proposed_price
                              });
                              setShowAddModal(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px', color: '#ff3b30' }}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '24px' }}>
              {editingItem ? 'Edit Inventory Request' : 'Add Inventory Request'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Brand Selection */}
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <select
                  className="form-input"
                  value={formData.brand_id}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      brand_id: e.target.value,
                      phone_model_id: '',
                      component_id: ''
                    });
                    setModels([]);
                    setModelComponents([]);
                  }}
                  required
                  disabled={editingItem}
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              <div className="form-group">
                <label className="form-label">Phone Model *</label>
                <select
                  className="form-input"
                  value={formData.phone_model_id}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      phone_model_id: e.target.value,
                      component_id: ''
                    });
                    setModelComponents([]);
                  }}
                  required
                  disabled={!formData.brand_id || editingItem}
                >
                  <option value="">Select Model</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
                {!formData.brand_id && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Please select a brand first
                  </p>
                )}
              </div>

              {/* Component Selection */}
              <div className="form-group">
                <label className="form-label">Component *</label>
                <select
                  className="form-input"
                  value={formData.component_id}
                  onChange={(e) => setFormData({ ...formData, component_id: e.target.value })}
                  required
                  disabled={!formData.phone_model_id || editingItem}
                >
                  <option value="">Select Component</option>
                  {modelComponents.map(component => (
                    <option key={component.id} value={component.id}>
                      {component.name} ({component.category})
                    </option>
                  ))}
                </select>
                {!formData.phone_model_id && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Please select a model first
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  required
                  placeholder="Enter quantity"
                />
              </div>

              {/* Proposed Price */}
              <div className="form-group">
                <label className="form-label">Proposed Price (USD) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.proposed_price}
                  onChange={(e) => setFormData({ ...formData, proposed_price: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Enter price per unit"
                />
              </div>

              {editingItem && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ fontSize: '13px', color: '#856404', margin: 0 }}>
                    ⚠️ Editing will reset the approval status to "Pending"
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    setFormData({
                      brand_id: '',
                      phone_model_id: '',
                      component_id: '',
                      quantity: '',
                      proposed_price: ''
                    });
                    setModels([]);
                    setModelComponents([]);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : (editingItem ? 'Update Request' : 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
