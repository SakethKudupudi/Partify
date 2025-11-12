import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function AddInventory() {
  const [brands, setBrands] = useState([]);
  const [phoneModels, setPhoneModels] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchPhoneModels(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchData = async () => {
    try {
      const [brandsRes, componentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/brands`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/components`)
      ]);
      setBrands(brandsRes.data);
      setComponents(componentsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoneModels = async (brandId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/phone-models/brand/${brandId}`
      );
      setPhoneModels(response.data);
      setSelectedModel('');
    } catch (error) {
      toast.error('Failed to fetch phone models');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedModel || !selectedComponent || !quantity || !price) {
      toast.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/vendor-inventory`,
        {
          phone_model_id: selectedModel,
          component_id: selectedComponent,
          quantity: parseInt(quantity),
          proposed_price: parseFloat(price)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Inventory added successfully! Awaiting admin approval.');
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedComponent('');
      setQuantity('');
      setPrice('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add inventory');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Inventory</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Model *
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              required
              disabled={!selectedBrand}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select a phone model</option>
              {phoneModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.model_number})
                </option>
              ))}
            </select>
          </div>

          {/* Component Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Component *
            </label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a component</option>
              {components.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.category})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
          </div>

          {/* Proposed Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposed Price (₹) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter price"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <FiPlus size={20} />
            {submitting ? 'Adding...' : 'Add Inventory'}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Note:</p>
            <p>
              All inventory additions must be approved by the admin before being visible to
              customers. You'll receive a notification once approved or rejected.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

