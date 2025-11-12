import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Shop</h4>
            <ul className="footer-links">
              <li><a href="/brands">Browse Brands</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/search">Search Components</a></li>
              <li><a href="/cart">Shopping Cart</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Account</h4>
            <ul className="footer-links">
              <li><a href="/account/profile">Profile</a></li>
              <li><a href="/orders">Orders</a></li>
              <li><a href="/account/addresses">Addresses</a></li>
              <li><a href="/account/payment-methods">Payment Methods</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="/support/faq">FAQ</a></li>
              <li><a href="/support/contact">Contact Us</a></li>
              <li><a href="/support/track-order">Track Order</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/support/contact">Report an Issue</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Partify. All rights reserved.</p>
          <p>Crafted with precision • Premium Components</p>
        </div>
      </div>
    </footer>
  );
}

