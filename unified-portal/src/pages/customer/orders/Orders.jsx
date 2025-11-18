import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Orders() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        fetchOrderDetails(orderId);
      }
    }
  }, [orderId, orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/customer/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/customer/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order details fetched:', data);
        console.log('Order items:', data.order_items);
        setSelectedOrder(data);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error loading order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#0071e3';
      case 'processing': return '#ff9500';
      case 'shipped': return '#007aff';
      case 'delivered': return '#34c759';
      case 'cancelled': return '#ff3b30';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/customer/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Order cancelled successfully');
        fetchOrders();
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      toast.error('Error cancelling order');
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // Show order details if orderId is provided
  if (selectedOrder) {
    if (detailLoading) {
      return (
        <div className="section">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading order details...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="section">
        <button
          onClick={() => navigate('/orders')}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ← Back to Orders
        </button>

        <div className="section-title">
          <h2>Order Details</h2>
          <p>Order #{selectedOrder.order_number || selectedOrder.id.substring(0, 8).toUpperCase()}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Order Information */}
          <div>
            {/* Order Header */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Order Number</p>
                  <p style={{ fontSize: '18px', fontWeight: '700' }}>{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Status</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(selectedOrder.status) + '20',
                    color: getStatusColor(selectedOrder.status)
                  }}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Order Date</p>
                <p style={{ fontSize: '14px' }}>
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Shipping Address</h4>
              <p style={{ whiteSpace: 'pre-line', color: '#333', lineHeight: '1.6' }}>
                {selectedOrder.shipping_address}
              </p>
            </div>

            {/* Order Items */}
            <div className="card">
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Order Items</h4>
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.order_items.map((item, idx) => {
                    console.log('Rendering item:', item);
                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: idx < selectedOrder.order_items.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            {item.vendor_inventory?.components?.name || 'Component Item'}
                          </p>
                          <p style={{ fontSize: '13px', color: '#666' }}>
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>
                          ${parseFloat(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No items in this order (items: {selectedOrder.order_items?.length || 0})</p>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '20px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Order Summary</h4>
              
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span>${parseFloat(selectedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Total Items</span>
                  <span>{selectedOrder.total_items}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: '700' }}>
                <span>Total</span>
                <span>${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => cancelOrder(selectedOrder.id)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#ff3b30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => navigate(`/orders/${selectedOrder.id}/track`)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#0071e3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        <h2>My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ marginBottom: '12px', color: '#333' }}>No orders yet</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>Start shopping to place your first order!</p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '16px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                    Order #{order.id.substring(0, 8).toUpperCase()}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    Placed on: {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {order.shipping_address}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(order.status) + '20',
                    color: getStatusColor(order.status),
                    marginBottom: '8px'
                  }}>
                    {getStatusText(order.status)}
                  </span>
                  <p style={{ fontSize: '20px', fontWeight: '700' }}>
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#666' }}>
                    Items ({order.order_items.length})
                  </h4>
                  {order.order_items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: idx < order.order_items.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500' }}>
                          Component Item
                        </p>
                        <p style={{ fontSize: '13px', color: '#666' }}>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>
                        ${parseFloat(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ff3b30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0071e3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
