import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ModelDetails() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // Track quantity for each component
  const [selectedVendors, setSelectedVendors] = useState({}); // Track selected vendor for each component

  const API_URL = 'http://localhost:8080/api/customer';

  useEffect(() => {
    fetchModelDetails();
  }, [modelId]);

  const fetchModelDetails = async () => {
    try {
      // Fetch model details
      const modelRes = await fetch(`${API_URL}/models/${modelId}`);
      if (modelRes.ok) {
        const modelData = await modelRes.json();
        setModel(modelData);
      } else {
        toast.error('Model not found');
        navigate('/brands');
        return;
      }

      // Fetch components for this model
      const componentsRes = await fetch(`${API_URL}/models/${modelId}/components`);
      if (componentsRes.ok) {
        const componentsData = await componentsRes.json();
        setComponents(componentsData);
      }
    } catch (error) {
      toast.error('Error loading model details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupedComponents = components.reduce((acc, component) => {
    const category = component.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {});

  const handleQuantityChange = (componentId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [componentId]: qty }));
  };

  const handleVendorSelect = (componentId, vendorInventoryId) => {
    setSelectedVendors(prev => ({ ...prev, [componentId]: vendorInventoryId }));
  };

  const addToCart = async (component) => {
    const quantity = quantities[component.component_id] || 1;
    const vendorInventoryId = selectedVendors[component.component_id] || component.vendors[0]?.id;

    if (!vendorInventoryId) {
      toast.error('Please select a vendor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventory_id: vendorInventoryId,
          quantity: quantity
        })
      });

      if (response.ok) {
        toast.success(`Added ${quantity} ${component.name}(s) to cart!`);
        // Reset quantity after adding
        setQuantities(prev => ({ ...prev, [component.component_id]: 1 }));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <div className="section">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          to="/brands" 
          style={{ color: '#0066cc', textDecoration: 'none', marginRight: '8px' }}
        >
          Brands
        </Link>
        <span style={{ color: '#666' }}>›</span>
        <Link 
          to={`/brands/${model.brand_id}`}
          style={{ color: '#0066cc', textDecoration: 'none', margin: '0 8px' }}
        >
          {model.brands?.name || 'Brand'}
        </Link>
        <span style={{ color: '#666' }}>›</span>
        <span style={{ margin: '0 8px', color: '#1d1d1f' }}>{model.name}</span>
      </div>

      {/* Model Header */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* Model Image */}
          <div style={{
            backgroundColor: '#f5f5f7',
            borderRadius: '12px',
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            {model.image_url ? (
              <img
                src={model.image_url}
                alt={model.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{ fontSize: '120px', color: '#ccc' }}>📱</span>
            )}
          </div>

          {/* Model Info */}
          <div>
            <h1 style={{ marginBottom: '16px', fontSize: '36px' }}>{model.name}</h1>
            
            {model.release_date && (
              <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
                Released: {new Date(model.release_date).getFullYear()}
              </p>
            )}

            {model.specification && (
              <div style={{
                backgroundColor: '#f5f5f7',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Specifications</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {model.specification}
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#f5f5f7',
              borderRadius: '8px'
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', color: '#0066cc', marginBottom: '8px' }}>
                  {components.length}
                </h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Available Components</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', color: '#34c759', marginBottom: '8px' }}>
                  {Object.keys(groupedComponents).length}
                </h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Components Section */}
      <div className="section-title">
        <h2>Available Components</h2>
      </div>

      {components.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>
            No components available for this model yet.
          </p>
        </div>
      ) : (
        Object.entries(groupedComponents).map(([category, categoryComponents]) => (
          <div key={category} style={{ marginBottom: '32px' }}>
            <h3 style={{
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#f5f5f7',
              borderRadius: '8px',
              fontSize: '18px'
            }}>
              {category} ({categoryComponents.length})
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {categoryComponents.map(component => (
                <div key={component.id} className="card">
                  <div style={{
                    display: 'flex',
                    alignItems: 'start',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#0066cc',
                      color: 'white',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontSize: '20px'
                    }}>
                      🔧
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>
                        {component.name}
                      </h4>
                      {component.description && (
                        <p style={{
                          color: '#666',
                          fontSize: '13px',
                          lineHeight: '1.4'
                        }}>
                          {component.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {component.specifications && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f5f5f7',
                      borderRadius: '6px',
                      marginTop: '12px',
                      marginBottom: '12px'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#666',
                        lineHeight: '1.5'
                      }}>
                        {component.specifications}
                      </p>
                    </div>
                  )}

                  {/* Vendor Pricing */}
                  {component.vendors && component.vendors.length > 0 ? (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#666',
                        marginBottom: '8px'
                      }}>
                        Select Vendor:
                      </p>
                      <select
                        value={selectedVendors[component.component_id] || component.vendors[0]?.id || ''}
                        onChange={(e) => handleVendorSelect(component.component_id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}
                      >
                        {component.vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.vendors?.store_name || 'Vendor'} - ${parseFloat(vendor.proposed_price).toFixed(2)} ({vendor.quantity} in stock)
                          </option>
                        ))}
                      </select>

                      {/* Quantity Selector */}
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#666',
                          marginBottom: '8px'
                        }}>
                          Quantity:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleQuantityChange(component.component_id, (quantities[component.component_id] || 1) - 1)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantities[component.component_id] || 1}
                            onChange={(e) => handleQuantityChange(component.component_id, e.target.value)}
                            style={{
                              width: '60px',
                              padding: '8px',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              textAlign: 'center',
                              fontSize: '14px'
                            }}
                          />
                          <button
                            onClick={() => handleQuantityChange(component.component_id, (quantities[component.component_id] || 1) + 1)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '6px',
                      marginTop: '12px'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#856404',
                        margin: 0
                      }}>
                        Currently unavailable
                      </p>
                    </div>
                  )}

                  {component.vendors && component.vendors.length > 0 && (
                    <button
                      className="btn"
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        backgroundColor: '#0071e3',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 113, 227, 0.2)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#0077ED';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 227, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#0071e3';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 113, 227, 0.2)';
                      }}
                      onClick={() => addToCart(component)}
                    >
                      <span style={{ fontSize: '18px' }}>🛒</span>
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
