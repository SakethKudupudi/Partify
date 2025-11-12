import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ComponentsList() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Display Components',
    description: '',
    specifications: ''
  });

  const API_URL = 'http://localhost:8080/api/admin';

  const COMPONENT_CATEGORIES = [
    'Display Components',
    'Power Components',
    'Audio Components',
    'Camera Components',
    'Connectivity Components',
    'Body Components',
    'Internal Components'
  ];

  useEffect(() => {
    fetchBrands();
    fetchModels();
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
      console.error('Error fetching brands');
    }
  };

  const fetchModels = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const getComponentsByCategory = (model) => {
    if (!model.available_components || model.available_components.length === 0) {
      return {};
    }

    // Group components by their category
    // Since available_components is just an array of names, we need to fetch full component details
    return model.available_components.reduce((acc, componentName) => {
      // Try to determine category from component name patterns
      let category = 'Other';
      
      if (componentName.includes('Screen') || componentName.includes('Display') || componentName.includes('LCD') || componentName.includes('Digitizer')) {
        category = 'Display Components';
      } else if (componentName.includes('Battery') || componentName.includes('Charging')) {
        category = 'Power Components';
      } else if (componentName.includes('Speaker') || componentName.includes('Microphone') || componentName.includes('Audio') || componentName.includes('Buzzer') || componentName.includes('Headphone')) {
        category = 'Audio Components';
      } else if (componentName.includes('Camera')) {
        category = 'Camera Components';
      } else if (componentName.includes('Antenna') || componentName.includes('WiFi') || componentName.includes('Bluetooth') || componentName.includes('GPS') || componentName.includes('SIM')) {
        category = 'Connectivity Components';
      } else if (componentName.includes('Cover') || componentName.includes('Housing') || componentName.includes('Frame') || componentName.includes('Button') || componentName.includes('Vibration')) {
        category = 'Body Components';
      } else if (componentName.includes('Motherboard') || componentName.includes('Processor') || componentName.includes('Memory') || componentName.includes('GPU') || componentName.includes('CPU') || componentName.includes('Flex')) {
        category = 'Internal Components';
      }

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(componentName);
      return acc;
    }, {});
  };

  const handleAddComponent = async (e) => {
    e.preventDefault();
    
    if (!selectedModel) {
      toast.error('Please select a model first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // First create the component
      const componentResponse = await fetch(`${API_URL}/components`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!componentResponse.ok) {
        throw new Error('Failed to create component');
      }

      const newComponent = await componentResponse.json();

      // Then link it to the model by updating the model's components
      const updatedComponents = [...(selectedModel.available_components || []), formData.name];
      
      const modelResponse = await fetch(`${API_URL}/models/${selectedModel.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brand_id: selectedModel.brand_id,
          name: selectedModel.name,
          release_year: selectedModel.release_date ? selectedModel.release_date.split('-')[0] : null,
          specifications: selectedModel.specification,
          image_url: selectedModel.image_url,
          available_components: updatedComponents
        })
      });

      if (modelResponse.ok) {
        toast.success('Component added to model!');
        setShowModal(false);
        setFormData({
          name: '',
          category: 'Display Components',
          description: '',
          specifications: ''
        });
        fetchModels();
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveComponent = async (model, componentName) => {
    if (!confirm(`Remove "${componentName}" from ${model.name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const updatedComponents = model.available_components.filter(c => c !== componentName);
      
      const response = await fetch(`${API_URL}/models/${model.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brand_id: model.brand_id,
          name: model.name,
          release_year: model.release_date ? model.release_date.split('-')[0] : null,
          specifications: model.specification,
          image_url: model.image_url,
          available_components: updatedComponents
        })
      });

      if (response.ok) {
        toast.success('Component removed!');
        fetchModels();
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  if (loading && models.length === 0) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Filter models based on selected brand and model name
  const filteredModels = models.filter(model => {
    const matchesBrand = !filterBrand || model.brand_id === filterBrand;
    const matchesModel = !filterModel || model.name.toLowerCase().includes(filterModel.toLowerCase());
    return matchesBrand && matchesModel;
  });

  return (
    <div className="section">
      <div className="section-title">
        <h2>Components by Model</h2>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          Each model has its own unique set of components
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Brand</label>
            <select
              className="form-input"
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setFilterModel(''); // Reset model filter when brand changes
              }}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Model Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search model name..."
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
            />
          </div>
        </div>

        {(filterBrand || filterModel) && (
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            Showing {filteredModels.length} of {models.length} model{models.length !== 1 ? 's' : ''}
            <button
              onClick={() => {
                setFilterBrand('');
                setFilterModel('');
              }}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {filteredModels.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
            {models.length === 0 
              ? 'No models yet. Add models first to manage their components.'
              : 'No models match your filter criteria.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredModels.map(model => {
            const componentsByCategory = getComponentsByCategory(model);
            const totalComponents = model.available_components?.length || 0;
            const brand = brands.find(b => b.id === model.brand_id);

            return (
              <div key={model.id} className="card">
                {/* Model Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {model.image_url && (
                      <img
                        src={model.image_url}
                        alt={model.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'contain',
                          backgroundColor: '#f5f5f7',
                          borderRadius: '8px',
                          padding: '8px'
                        }}
                      />
                    )}
                    <div>
                      <h3 style={{ marginBottom: '4px', fontSize: '20px' }}>{model.name}</h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        {totalComponents} component{totalComponents !== 1 ? 's' : ''} • 
                        {Object.keys(componentsByCategory).length} categor{Object.keys(componentsByCategory).length !== 1 ? 'ies' : 'y'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModal(true);
                    }}
                  >
                    + Add Component
                  </button>
                </div>

                {/* Components by Category */}
                {totalComponents === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f7', borderRadius: '8px' }}>
                    <p style={{ color: '#666' }}>No components yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.entries(componentsByCategory).map(([category, components]) => (
                      <div key={category}>
                        <h4 style={{
                          fontSize: '16px',
                          marginBottom: '12px',
                          color: '#0066cc',
                          fontWeight: '600'
                        }}>
                          {category} ({components.length})
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '12px'
                        }}>
                          {components.map(componentName => (
                            <div
                              key={componentName}
                              style={{
                                padding: '12px 16px',
                                backgroundColor: '#f5f5f7',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span style={{ fontSize: '14px' }}>{componentName}</span>
                              <button
                                onClick={() => handleRemoveComponent(model, componentName)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ff3b30',
                                  cursor: 'pointer',
                                  fontSize: '18px',
                                  padding: '0 4px'
                                }}
                                title="Remove component"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Component Modal */}
      {showModal && selectedModel && (
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
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '8px' }}>Add Component to {selectedModel.name}</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              This component will be unique to this model
            </p>

            <form onSubmit={handleAddComponent}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {COMPONENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Component Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Screen/LCD Assembly"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the component"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specifications</label>
                <textarea
                  className="form-input"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="Technical specifications, compatibility notes, etc."
                  rows="4"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedModel(null);
                    setFormData({
                      name: '',
                      category: 'Display Components',
                      description: '',
                      specifications: ''
                    });
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
                  {loading ? 'Adding...' : 'Add Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
