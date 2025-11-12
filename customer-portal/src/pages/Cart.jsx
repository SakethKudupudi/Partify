import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import useCartStore from '../store/cartStore';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/cart/items/${cartItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Item removed');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/cart/items/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error('Please enter shipping address');
      return;
    }

    setPlacing(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        { shipping_address: shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully! Order ID: ' + response.data.order_id);
      setShippingAddress('');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <a
              href="/brands"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow p-6 flex items-center gap-6"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.inventory_id}
                      </h3>
                      <p className="text-lg font-bold text-blue-600 mt-1">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <FiMinus size={20} />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <FiPlus size={20} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter your full shipping address"
                  />
                </div>

                <button
                  type="submit"
                  disabled={placing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {placing ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

