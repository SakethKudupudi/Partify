import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const fetchInventory = async () => {
    try {
      const url = lowStockOnly
        ? `${import.meta.env.VITE_API_URL}/api/vendor-inventory/low-stock`
        : `${import.meta.env.VITE_API_URL}/api/vendor-inventory`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className="text-green-600" size={20} />;
      case 'pending_approval':
        return <FiClock className="text-orange-600" size={20} />;
      case 'rejected':
        return <FiXCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            lowStockOnly
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          {lowStockOnly ? '⚠️ Low Stock Only' : '📊 Show All'}
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No inventory items found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Phone Model
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Component
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Price
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Added
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">
                      {item.phone_models?.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600">
                      {item.components?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.components?.category}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full font-bold ${
                        item.quantity < 10 ? 'bg-red-100 text-red-800' : 'text-gray-800'
                      }`}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ₹{item.proposed_price}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

