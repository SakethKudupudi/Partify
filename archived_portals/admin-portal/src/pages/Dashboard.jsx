import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUsers, FiPackage, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg shadow p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-100 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <Icon size={40} className="opacity-50" />
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={FiPackage}
          label="Total Brands"
          value={stats?.total_brands || 0}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FiPackage}
          label="Phone Models"
          value={stats?.total_phone_models || 0}
          color="from-green-500 to-green-600"
        />
        <StatCard
          icon={FiPackage}
          label="Components"
          value={stats?.total_components || 0}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Pending Requests"
          value={stats?.pending_vendor_requests || 0}
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={FiShoppingCart}
          label="Total Orders"
          value={stats?.total_orders || 0}
          color="from-red-500 to-red-600"
        />
        <StatCard
          icon={FiUsers}
          label="Active Vendors"
          value={stats?.total_vendors || 0}
          color="from-indigo-500 to-indigo-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold transition-colors">
            Add Brand
          </button>
          <button className="bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-lg font-semibold transition-colors">
            Add Phone Model
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 rounded-lg font-semibold transition-colors">
            Add Component
          </button>
          <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-3 rounded-lg font-semibold transition-colors">
            Review Requests
          </button>
        </div>
      </div>
    </div>
  );
}

