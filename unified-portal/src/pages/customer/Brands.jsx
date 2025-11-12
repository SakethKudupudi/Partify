import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CustomerBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/customer';

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      console.log('Fetching brands from:', `${API_URL}/brands`);
      const response = await fetch(`${API_URL}/brands`);

      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Brands data received:', data);
        console.log('Number of brands:', data.length);
        setBrands(data);
      } else {
        console.error('Failed to fetch brands, status:', response.status);
        toast.error('Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="section-title">
        <h2>Browse by Brand</h2>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Choose your favorite phone brand
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>
            No brands available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {brands.map(brand => (
            <Link
              key={brand.id}
              to={`/brands/${brand.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                overflow: 'hidden'
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
                  height: '200px',
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  {brand.image_url ? (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px', color: '#ccc' }}>📱</span>
                  )}
                </div>

                <h3 style={{
                  marginBottom: '12px',
                  fontSize: '24px',
                  color: '#1d1d1f',
                  textAlign: 'center'
                }}>
                  {brand.name}
                </h3>

                {brand.description && (
                  <p style={{
                    color: '#666',
                    fontSize: '14px',
                    textAlign: 'center',
                    lineHeight: '1.6'
                  }}>
                    {brand.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
