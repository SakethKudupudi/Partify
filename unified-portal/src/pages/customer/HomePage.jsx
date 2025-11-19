import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CustomerHomePage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/customer';

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_URL}/brands`);

      if (response.ok) {
        const data = await response.json();
        console.log('Brands fetched:', data); // Debug log
        setBrands(data);
      } else {
        console.error('Failed to fetch brands:', response.status);
        toast.error('Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        marginBottom: '40px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', color: 'white' }}>
          Welcome to Partify
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px' }}>
          Find and buy genuine phone components from verified vendors
        </p>
        <Link to="/brands">
          <button className="btn btn-primary" style={{
            backgroundColor: 'white',
            color: '#667eea',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Browse Brands
          </button>
        </Link>
      </div>

      {/* Featured Brands */}
      <div className="section-title">
        <h2>Featured Brands</h2>
        <Link to="/brands" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '14px' }}>
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
            No brands available yet. Check back soon!
          </p>
          <Link to="/brands">
            <button className="btn btn-primary">Go to Brands</button>
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {brands.slice(0, 6).map(brand => (
            <Link
              key={brand.id}
              to={`/brands/${brand.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textAlign: 'center'
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
                  height: '140px',
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  borderRadius: '8px'
                }}>
                  {brand.image_url ? (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      style={{
                        maxWidth: '70%',
                        maxHeight: '70%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '40px', color: '#ccc' }}>📱</span>
                  )}
                </div>

                <h3 style={{
                  marginBottom: '8px',
                  fontSize: '20px',
                  color: '#1d1d1f'
                }}>
                  {brand.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* How It Works */}
      <div style={{ marginTop: '60px' }}>
        <div className="section-title">
          <h2>How It Works</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ marginBottom: '12px' }}>Browse Components</h3>
            <p style={{ color: '#666' }}>
              Search for phone parts by brand and model
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
            <h3 style={{ marginBottom: '12px' }}>Add to Cart</h3>
            <p style={{ color: '#666' }}>
              Select components from verified vendors
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ marginBottom: '12px' }}>Secure Checkout</h3>
            <p style={{ color: '#666' }}>
              Complete your purchase safely and track your order
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
