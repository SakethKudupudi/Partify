import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BrandModels() {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8080/api/customer';

  useEffect(() => {
    fetchBrandAndModels();
  }, [brandId]);

  const fetchBrandAndModels = async () => {
    try {
      console.log('=== BrandModels Component ===');
      console.log('Brand ID from URL:', brandId);
      console.log('API URL:', API_URL);
      
      // Fetch brand details
      const brandUrl = `${API_URL}/brands/${brandId}`;
      console.log('Fetching brand from:', brandUrl);
      const brandRes = await fetch(brandUrl);
      console.log('Brand response status:', brandRes.status);
      
      if (brandRes.ok) {
        const brandData = await brandRes.json();
        console.log('Brand data received:', brandData);
        setBrand(brandData);
      } else {
        console.error('Failed to fetch brand:', brandRes.status);
        toast.error('Failed to load brand');
      }

      // Fetch models for this brand
      const modelsUrl = `${API_URL}/brands/${brandId}/models`;
      console.log('Fetching models from:', modelsUrl);
      const modelsRes = await fetch(modelsUrl);
      console.log('Models response status:', modelsRes.status);
      
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        console.log('Models data received:', modelsData);
        console.log('Number of models:', modelsData.length);
        setModels(modelsData);
      } else {
        console.error('Failed to fetch models:', modelsRes.status);
        toast.error('Failed to load models');
      }
    } catch (error) {
      console.error('ERROR in fetchBrandAndModels:', error);
      console.error('Error stack:', error.stack);
      setError(error.message);
      toast.error('Error loading data: ' + error.message);
    } finally {
      console.log('Fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fee' }}>
          <h3 style={{ color: '#c00' }}>Error Loading Page</h3>
          <p style={{ color: '#666' }}>{error}</p>
          <Link to="/brands">
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              Back to Brands
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading models...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666' }}>Brand not found</p>
          <Link to="/brands">
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              Back to Brands
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/brands" style={{ color: '#0066cc', textDecoration: 'none' }}>
          ← Back to Brands
        </Link>
      </div>

      {/* Brand Header */}
      <div className="card" style={{ marginBottom: '32px', textAlign: 'center' }}>
        {brand.image_url && (
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={brand.image_url}
              alt={brand.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
        <h1 style={{ marginBottom: '12px' }}>{brand.name}</h1>
        {brand.description && (
          <p style={{ color: '#666', fontSize: '16px' }}>{brand.description}</p>
        )}
      </div>

      {/* Models Grid */}
      <div className="section-title">
        <h2>Available Models</h2>
      </div>

      {models.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>
            No models available for {brand.name} yet.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {models.map(model => (
            <Link
              key={model.id}
              to={`/models/${model.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}>
                <div style={{
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  borderRadius: '8px'
                }}>
                  {model.image_url ? (
                    <img
                      src={model.image_url}
                      alt={model.name}
                      style={{
                        maxWidth: '85%',
                        maxHeight: '85%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px', color: '#ccc' }}>📱</span>
                  )}
                </div>

                <h3 style={{ marginBottom: '8px', fontSize: '20px', color: '#1d1d1f' }}>
                  {model.name}
                </h3>

                {model.release_date && (
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                    Release: {new Date(model.release_date).getFullYear()}
                  </p>
                )}

                {model.specification && (
                  <p style={{
                    color: '#666',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    maxHeight: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {model.specification}
                  </p>
                )}

                <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                  View Components
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
