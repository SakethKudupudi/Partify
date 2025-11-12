import React from 'react';
import '../styles/apple.css';

export default function Navigation() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">Partify</a>

        <ul className="navbar-menu">
          <li><a href="/brands">Shop</a></li>
          <li><a href="/categories">Categories</a></li>
          <li><a href="/support/contact">Support</a></li>
        </ul>

        <div className="navbar-actions">
          <a href="/search" className="btn btn-sm btn-outline">Search</a>
          <a href="/cart" className="btn btn-sm btn-primary">Cart</a>
          <a href="/account" className="btn btn-sm btn-outline">Account</a>
        </div>
      </div>
    </nav>
  );
}

