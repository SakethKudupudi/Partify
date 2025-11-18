import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/cart';

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        toast.error('Failed to load cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error loading cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        fetchCart();
        toast.success('Cart updated');
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      toast.error('Error updating cart');
    }
  };

  const removeItem = async (cartItemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/items/${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Item removed from cart');
        fetchCart();
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      toast.error('Error removing item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear all items from cart?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Cart cleared');
        fetchCart();
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      toast.error('Error clearing cart');
    }
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Shopping Cart</h2>
        {cart.items.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff3b30',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <h3 style={{ marginBottom: '12px', color: '#333' }}>Your cart is empty</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>Add some items to get started!</p>
          <button
            onClick={() => navigate('/brands')}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              backgroundColor: '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="card">
            {cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  alignItems: 'center'
                }}
              >
                {/* Item Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f5f5f7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px'
                }}>
                  🔧
                </div>

                {/* Item Details */}
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>
                    Component Item
                  </h4>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    Inventory ID: {item.inventory_id}
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#0071e3' }}>
                    ${parseFloat(item.price).toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Controls & Remove */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{
                      width: '48px',
                      textAlign: 'center',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ff3b30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ maxWidth: '400px', marginLeft: 'auto' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '16px' }}>
                <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '16px' }}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div style={{
                borderTop: '2px solid #000',
                paddingTop: '12px',
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>

              <button
                onClick={proceedToCheckout}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#0071e3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0077ED'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0071e3'}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/brands')}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#0071e3',
                  border: '1px solid #0071e3',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
