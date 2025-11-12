import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ModelDetails() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

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
                        Available from {component.vendors.length} vendor{component.vendors.length > 1 ? 's' : ''}:
                      </p>
                      {component.vendors.slice(0, 3).map((vendor, idx) => (
                        <div
                          key={vendor.id}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '6px',
                            marginBottom: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>
                              {vendor.vendors?.store_name || 'Vendor'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#666' }}>
                              {vendor.quantity} in stock
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#0066cc' }}>
                              ${parseFloat(vendor.proposed_price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {component.vendors.length > 3 && (
                        <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                          +{component.vendors.length - 3} more vendor{component.vendors.length - 3 > 1 ? 's' : ''}
                        </p>
                      )}
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
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '12px' }}
                      onClick={() => {
                        // Add to cart functionality
                        toast.success('Component added to cart!');
                      }}
                    >
                      View Vendors & Add to Cart
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
