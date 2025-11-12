import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VendorBrandsView() {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/customer'; // Vendors can use customer API to view

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand.id);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_URL}/brands`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
        if (data.length > 0) {
          setSelectedBrand(data[0]);
        }
      }
    } catch (error) {
      toast.error('Error fetching brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (brandId) => {
    try {
      const response = await fetch(`${API_URL}/brands/${brandId}/models`);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      toast.error('Error fetching models');
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

  return (
    <div className="section">
      <div className="section-title">
        <h2>Browse Brands & Models</h2>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          View available phone brands and models to add to your inventory
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>
            No brands available yet.
          </p>
        </div>
      ) : (
        <>
          {/* Brand Selector */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <label className="form-label">Select Brand</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {brands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  className={selectedBrand?.id === brand.id ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ minWidth: '120px' }}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Brand Info */}
          {selectedBrand && (
            <>
              <div className="card" style={{ marginBottom: '32px', textAlign: 'center' }}>
                {selectedBrand.image_url && (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={selectedBrand.image_url}
                      alt={selectedBrand.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
                <h2 style={{ marginBottom: '8px' }}>{selectedBrand.name}</h2>
                {selectedBrand.description && (
                  <p style={{ color: '#666' }}>{selectedBrand.description}</p>
                )}
              </div>

              {/* Models Grid */}
              <div className="section-title">
                <h3>{selectedBrand.name} Models</h3>
              </div>

              {models.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#666' }}>No models available for this brand.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {models.map(model => (
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
                              maxWidth: '85%',
                              maxHeight: '85%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '48px', color: '#ccc' }}>📱</span>
                        )}
                      </div>

                      <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>
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
                          lineHeight: '1.5',
                          maxHeight: '80px',
                          overflow: 'hidden'
                        }}>
                          {model.specification}
                        </p>
                      )}

                      <Link to={`/vendor/inventory/add?model=${model.id}`}>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                          Add to Inventory
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
