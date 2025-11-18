import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CustomerHomePage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

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

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        toast.success(`Found ${data.length} components`);
      } else {
        toast.error('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search error: ' + error.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="section">
      {/* Hero Section with AI Search */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #21201fff 0%)',/*. , #1a86bcff 100%*/
        borderRadius: '12px',
        marginBottom: '40px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', color: 'White' }}>
          Welcome to Partify
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', color: 'White' }}>
          Find and buy genuine phone components from verified vendors
        </p>
        
        {/* AI Search Box */}
        <form onSubmit={handleAISearch} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <input
              type="text"
              placeholder="Search for components, brands, or models... (e.g., 'iPhone 15 battery')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#333',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                padding: '14px 28px',
                backgroundColor: '#039bedff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: searching ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                opacity: searching ? 0.7 : 1
              }}
            >
              {searching ? '🔍 Searching...' : '🔍 AI Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults !== null && (
        <div className="card" style={{ marginBottom: '40px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #667eea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Search Results for "{searchQuery}"</h3>
            <button
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕ Clear
            </button>
          </div>
          
          {searchResults.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No components found. Try a different search query.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {searchResults.map(component => (
                <div key={component.id} className="card" style={{
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>⚙️</span>
                  <h4 style={{ marginBottom: '4px', color: '#333' }}>{component.name}</h4>
                  <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                    {component.category}
                  </p>
                  <small style={{ color: '#999' }}>
                    {component.description?.substring(0, 40)}...
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Featured Brands - Only show when not searching */}
      {searchResults === null && (
        <>
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
        </>
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
            <h3 style={{ marginBottom: '12px' }}>Search Components</h3>
            <p style={{ color: '#666' }}>
              Use AI search to find phone parts instantly
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
