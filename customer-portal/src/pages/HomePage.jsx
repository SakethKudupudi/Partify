import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1>Premium Phone Components</h1>
          <p className="hero-subtitle">Crafted with precision. Built for performance.</p>
          <div className="hero-cta">
            <Link to="/brands" className="btn btn-primary btn-lg">
              Explore Brands
            </Link>
            <Link to="/categories" className="btn btn-outline btn-lg">
              Browse All Components
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="section">
        <div className="section-title">
          <h2>Featured Brands</h2>
          <p>Discover premium components from world-class manufacturers</p>
        </div>
        <div className="grid grid-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card">
              <div className="card-image" style={{backgroundColor: '#f0f0f0'}} />
              <h3 className="card-title">Brand Name</h3>
              <p className="card-description">High-quality components for mobile devices</p>
              <Link to={`/brands/${i}`} className="btn btn-primary" style={{width: '100%', textAlign: 'center'}}>
                Explore
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Top Components */}
      <section className="section" style={{backgroundColor: '#f5f5f7'}}>
        <div className="section-title">
          <h2>Top Components</h2>
          <p>Most popular items from our curated selection</p>
        </div>
        <div className="grid grid-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card">
              <div className="card-image" style={{backgroundColor: '#e8e8ed'}} />
              <h4 className="card-title">Component</h4>
              <p className="card-description">Premium quality</p>
              <p className="card-price">₹{Math.floor(Math.random() * 5000) + 500}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="section-title">
          <h2>Why Choose Partify</h2>
          <p>Experience excellence in every component</p>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3 className="card-title">Verified Quality</h3>
            <p>All components are thoroughly tested and verified for authenticity and performance.</p>
          </div>
          <div className="card">
            <h3 className="card-title">Fast Shipping</h3>
            <p>Quick and reliable delivery to your doorstep with real-time tracking.</p>
          </div>
          <div className="card">
            <h3 className="card-title">24/7 Support</h3>
            <p>Our dedicated support team is always ready to help with any questions.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{backgroundColor: '#000', color: '#fff', textAlign: 'center', borderRadius: '24px', margin: '64px 16px'}}>
        <h2 style={{color: '#fff', marginBottom: '16px'}}>Ready to upgrade?</h2>
        <p style={{color: '#a1a1a6', marginBottom: '32px', fontSize: '18px'}}>
          Join thousands of satisfied customers shopping for premium phone components.
        </p>
        <Link to="/brands" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </section>
    </div>
  );
}

