import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Component categories with all available components
const COMPONENT_CATEGORIES = {
  'Display Components': [
    'Screen/LCD Assembly (with Digitizer and Glass)',
    'Touch Screen Digitizer',
    'Screen Protector Film'
  ],
  'Power Components': [
    'Battery',
    'Battery Connector',
    'Charging Port (Lightning/USB-C)'
  ],
  'Audio Components': [
    'Earpiece Speaker',
    'Loudspeaker',
    'Microphone',
    'Buzzer',
    'Headphone Jack'
  ],
  'Camera Components': [
    'Rear Camera Module',
    'Front Camera Assembly'
  ],
  'Connectivity Components': [
    'Antenna',
    'SIM Card Slot',
    'WiFi Module',
    'Bluetooth Module',
    'GPS Module'
  ],
  'Body Components': [
    'Back Cover/Glass',
    'Housing/Frame',
    'Vibration Motor',
    'Home Button/Fingerprint Scanner',
    'Side Buttons and Switches'
  ],
  'Internal Components': [
    'Motherboard/Logic Board',
    'Processor (CPU)',
    'Memory (RAM/ROM)',
    'Graphics Processor (GPU)',
    'Flex Cables and Connectors'
  ]
};

export default function ModelsManagement() {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
    release_year: new Date().getFullYear(),
    specifications: '',
    image_url: ''
  });

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchBrands();
    fetchAllModels();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      toast.error('Error fetching brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/models`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      toast.error('Error fetching models');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      toast.error('Error uploading image: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const toggleComponent = (component) => {
    setSelectedComponents(prev => {
      if (prev.includes(component)) {
        return prev.filter(c => c !== component);
      } else {
        return [...prev, component];
      }
    });
  };

  const toggleCategory = (category) => {
    const categoryComponents = COMPONENT_CATEGORIES[category];
    const allSelected = categoryComponents.every(comp => selectedComponents.includes(comp));
    
    if (allSelected) {
      // Deselect all in category
      setSelectedComponents(prev => prev.filter(c => !categoryComponents.includes(c)));
    } else {
      // Select all in category
      setSelectedComponents(prev => {
        const newComponents = [...prev];
        categoryComponents.forEach(comp => {
          if (!newComponents.includes(comp)) {
            newComponents.push(comp);
          }
        });
        return newComponents;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image first if a new image is selected
      let imageUrl = formData.image_url;
      if (selectedImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setLoading(false);
          return; // Stop if image upload failed
        }
      }

      const token = localStorage.getItem('token');
      const url = editingModel 
        ? `${API_URL}/models/${editingModel.id}`
        : `${API_URL}/models`;
      
      const method = editingModel ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        image_url: imageUrl,
        available_components: selectedComponents
      };

      console.log('=== SUBMITTING MODEL ===');
      console.log('Form data state:', formData);
      console.log('Release year from formData:', formData.release_year, 'Type:', typeof formData.release_year);
      console.log('Final payload:', payload);
      console.log('Release year being sent:', payload.release_year, 'Type:', typeof payload.release_year);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingModel ? 'Model updated!' : 'Model created!');
        setShowModal(false);
        setEditingModel(null);
        setSelectedImage(null);
        setImagePreview('');
        setSelectedComponents([]);
        setFormData({
          brand_id: '',
          name: '',
          release_year: new Date().getFullYear(),
          specifications: '',
          image_url: ''
        });
        // Force refresh the models list
        setModels([]);
        await fetchAllModels();
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

  const handleEdit = (model) => {
    setEditingModel(model);
    
    // Extract year from release_date if it exists
    let releaseYear = new Date().getFullYear();
    if (model.release_date) {
      // Parse year directly from the date string to avoid timezone issues
      releaseYear = parseInt(model.release_date.split('-')[0], 10);
    } else if (model.release_year) {
      releaseYear = model.release_year;
    }
    
    setFormData({
      brand_id: model.brand_id,
      name: model.name,
      release_year: releaseYear,
      specifications: model.specifications || model.specification || '',
      image_url: model.image_url || ''
    });
    setImagePreview(model.image_url || '');
    setSelectedImage(null);
    setSelectedComponents(model.available_components || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/models/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Model deleted!');
        fetchAllModels();
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const openCreateModal = () => {
    setEditingModel(null);
    setSelectedImage(null);
    setImagePreview('');
    setSelectedComponents([]);
    setFormData({
      brand_id: '',
      name: '',
      release_year: new Date().getFullYear(),
      specifications: '',
      image_url: ''
    });
    setShowModal(true);
  };

  if (loading && brands.length === 0) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666' }}>Please create a brand first before adding models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        <h2>Phone Models Management</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Model
        </button>
      </div>

      {/* Models Grid */}
      {models.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            No models added yet.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add First Model
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {models.map(model => {
            const brand = brands.find(b => b.id === model.brand_id);
            return (
              <div key={model.id} className="card">
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  borderRadius: '8px'
                }}>
                  {model.image_url ? (
                    <img 
                      src={model.image_url} 
                      alt={model.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain' 
                      }}
                    />
                  ) : (
                    <span style={{ color: '#999' }}>No image</span>
                  )}
                </div>
                
                <div style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  backgroundColor: '#007aff', 
                  color: 'white', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  marginBottom: '8px'
                }}>
                  {brand?.name || 'Unknown Brand'}
                </div>
                
                <h3 style={{ marginBottom: '4px', fontSize: '18px' }}>{model.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                  Release Year: {model.release_date ? model.release_date.split('-')[0] : (model.release_year || 'N/A')}
                </p>
                
                {(model.specifications || model.specification) && (
                  <p style={{ 
                    color: '#666', 
                    fontSize: '13px', 
                    marginBottom: '16px',
                    maxHeight: '60px',
                    overflow: 'hidden'
                  }}>
                    {model.specifications || model.specification}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleEdit(model)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleDelete(model.id)}
                    style={{ flex: 1, color: '#ff3b30' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}      {/* Modal */}
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
              {editingModel ? 'Edit Model' : 'Add New Model'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <select
                  className="form-input"
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  required
                >
                  <option value="">Select a brand...</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Model Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Release Year *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.release_year}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : Number(e.target.value);
                    setFormData({ ...formData, release_year: value });
                  }}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specifications</label>
                <textarea
                  className="form-input"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="Display, Processor, Camera, Battery, etc."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="form-input"
                  style={{ padding: '8px' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Max size: 5MB. Supported formats: JPG, PNG, WEBP
                </p>
                
                {(imagePreview || formData.image_url) && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#f5f5f7', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <img 
                      src={imagePreview || formData.image_url} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p style={{ display: 'none', color: '#999', fontSize: '12px', margin: 0 }}>
                      Invalid image
                    </p>
                    {selectedImage && (
                      <p style={{ fontSize: '12px', color: '#007aff', marginTop: '8px' }}>
                        ✓ New image selected: {selectedImage.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Available Components Section */}
              <div className="form-group">
                <label className="form-label">Available Components ({selectedComponents.length} selected)</label>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  {Object.entries(COMPONENT_CATEGORIES).map(([category, components]) => {
                    const categorySelected = components.filter(c => selectedComponents.includes(c)).length;
                    const allSelected = categorySelected === components.length;
                    
                    return (
                      <div key={category} style={{ marginBottom: '16px' }}>
                        <div 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: '#f5f5f7',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginBottom: '8px'
                          }}
                          onClick={() => toggleCategory(category)}
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => {}}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                          />
                          <strong style={{ flex: 1, fontSize: '14px' }}>
                            {category}
                          </strong>
                          <span style={{ 
                            fontSize: '12px', 
                            backgroundColor: allSelected ? '#34c759' : '#999',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {categorySelected}/{components.length}
                          </span>
                        </div>
                        
                        <div style={{ paddingLeft: '24px' }}>
                          {components.map(component => (
                            <label
                              key={component}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#333',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <input
                                type="checkbox"
                                checked={selectedComponents.includes(component)}
                                onChange={() => toggleComponent(component)}
                                style={{ marginRight: '8px', cursor: 'pointer' }}
                              />
                              {component}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Select the components available for this phone model. Click category headers to select/deselect all.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingModel(null);
                    setSelectedImage(null);
                    setImagePreview('');
                    setSelectedComponents([]);
                  }}
                  style={{ flex: 1 }}
                  disabled={loading || uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={loading || uploading}
                >
                  {uploading ? 'Uploading Image...' : loading ? 'Saving...' : (editingModel ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
