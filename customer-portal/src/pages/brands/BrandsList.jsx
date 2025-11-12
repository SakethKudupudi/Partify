import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function BrandsList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/customer/brands');
        setBrands(response.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="loading" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-container">
          <h1>Premium Phone Brands</h1>
          <p className="hero-subtitle">Explore components from the world's leading manufacturers</p>
        </div>
      </section>

      <section className="section">
        <div className="grid grid-2">
          {brands.map(brand => (
            <Link
              key={brand.id}
              to={`/brands/${brand.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  className="card-image"
                  style={{
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: 'bold'
                  }}
                >
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} style={{ maxWidth: '80%', maxHeight: '80%' }} />
                  ) : (
                    brand.name.charAt(0)
                  )}
                </div>
                <h3 className="card-title">{brand.name}</h3>
                <p className="card-description" style={{ flex: 1 }}>
                  {brand.description || 'Premium quality components'}
                </p>
                <div className="btn btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: 'auto' }}>
                  Explore Collection
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

