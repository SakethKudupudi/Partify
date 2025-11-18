import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [formData, setFormData] = useState({
    // Shipping
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    // Payment
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateShipping = () => {
    const { fullName, email, phone, address, city, state, zipCode } = formData;
    if (!fullName || !email || !phone || !address || !city || !state || !zipCode) {
      toast.error('Please fill in all shipping details');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    const { cardNumber, cardName, expiryDate, cvv } = formData;
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error('Please fill in all payment details');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateShipping()) return;
    if (step === 2 && !validatePayment()) return;
    setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/customer/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Order placed successfully!');
        // Clear local cart state
        setCart({ items: [], total: 0 });
        // Navigate to orders page
        setTimeout(() => navigate('/orders'), 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Error placing order');
    } finally {
      setLoading(false);
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
        <h2>Checkout</h2>
      </div>

      {/* Progress Steps */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {['Shipping', 'Payment', 'Review'].map((label, index) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step > index ? '#34c759' : step === index + 1 ? '#0071e3' : '#e5e5e5',
                color: step >= index + 1 ? 'white' : '#999',
                lineHeight: '40px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {index + 1}
              </div>
              <p style={{
                fontSize: '14px',
                color: step >= index + 1 ? '#000' : '#999',
                fontWeight: step === index + 1 ? 'bold' : 'normal'
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Form Section */}
        <div>
          {step === 1 && (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Shipping Information</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address *"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={formData.state}
                    onChange={handleInputChange}
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code *"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Payment Information</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number *"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  maxLength="16"
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <input
                  type="text"
                  name="cardName"
                  placeholder="Name on Card *"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY *"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    maxLength="5"
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV *"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    maxLength="3"
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Review Order</h3>
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Shipping To:</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {formData.fullName}<br />
                  {formData.address}<br />
                  {formData.city}, {formData.state} {formData.zipCode}<br />
                  {formData.email} | {formData.phone}
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Payment Method:</h4>
                <p style={{ color: '#666' }}>
                  Card ending in {formData.cardNumber.slice(-4)}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'white',
                  color: '#0071e3',
                  border: '1px solid #0071e3',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#0071e3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#34c759',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Place Order
              </button>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Order Summary</h3>
          <div style={{ marginBottom: '16px' }}>
            {cart.items.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500' }}>Component</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: '16px', borderTop: '2px solid #000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '20px',
              fontWeight: '700',
              marginTop: '12px'
            }}>
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
