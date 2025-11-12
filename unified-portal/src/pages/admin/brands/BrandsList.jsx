import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function BrandsList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        toast.error('Failed to fetch brands');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingBrand 
        ? `${API_URL}/brands/${editingBrand.id}`
        : `${API_URL}/brands`;
      
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingBrand ? 'Brand updated!' : 'Brand created!');
        setShowModal(false);
        setEditingBrand(null);
        setFormData({ name: '', description: '', image_url: '' });
        fetchBrands();
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

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      image_url: brand.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Brand deleted!');
        fetchBrands();
      } else {
        toast.error('Failed to delete brand');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', image_url: '' });
    setShowModal(true);
  };

  if (loading && brands.length === 0) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Brands Management</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add New Brand
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>No brands yet. Create your first brand!</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Create Brand
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {brands.map(brand => (
            <div key={brand.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                width: '100%',
                height: '160px',
                backgroundColor: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {brand.image_url ? (
                  <img 
                    src={brand.image_url} 
                    alt={brand.name}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }}
                  />
                ) : (
                  <span style={{ color: '#999', fontSize: '14px' }}>No image</span>
                )}
              </div>
              
              <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{brand.name}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', minHeight: '40px' }}>
                {brand.description || 'No description'}
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleEdit(brand)}
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleDelete(brand.id)}
                  style={{ flex: 1, color: '#ff3b30' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: '24px' }}>
              {editingBrand ? 'Edit Brand' : 'Create New Brand'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Brand Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Apple, Samsung"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the brand"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.image_url && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#f5f5f7', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p style={{ display: 'none', color: '#999', fontSize: '12px', margin: 0 }}>
                      Invalid image URL
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingBrand(null);
                  }}
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingBrand ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
