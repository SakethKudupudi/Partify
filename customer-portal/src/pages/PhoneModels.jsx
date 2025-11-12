import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiMinus } from 'react-icons/fi';
import useCartStore from '../store/cartStore';

export default function PhoneModels({ brandId }) {
  const [phoneModels, setPhoneModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    fetchPhoneModels();
  }, [brandId]);

  const fetchPhoneModels = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/phone-models/brand/${brandId}`
      );
      setPhoneModels(response.data);
      if (response.data.length > 0) {
        fetchComponents(response.data[0].id);
        setSelectedModel(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch phone models');
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async (modelId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/phone-models/${modelId}`
      );
      setComponents(response.data.phone_model_components || []);
    } catch (error) {
      toast.error('Failed to fetch components');
    }
  };

  const handleSelectComponent = (componentId, inventory) => {
    if (selectedComponents[componentId]) {
      const { [componentId]: _, ...rest } = selectedComponents;
      setSelectedComponents(rest);
    } else {
      setSelectedComponents({
        ...selectedComponents,
        [componentId]: inventory
      });
    }
  };

  const handleAddToCart = () => {
    const cartItems = Object.entries(selectedComponents).map(([compId, inventory]) => ({
      inventory_id: inventory.id,
      quantity: quantities[compId] || 1
    }));

    cartItems.forEach(item => {
      addToCart(item.inventory_id, item.quantity);
    });

    toast.success('Items added to cart');
    setSelectedComponents({});
    setQuantities({});
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Select Phone Model & Components
        </h1>

        {/* Phone Models */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phoneModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model);
                  fetchComponents(model.id);
                  setSelectedComponents({});
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedModel?.id === model.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {model.image_url && (
                  <img
                    src={model.image_url}
                    alt={model.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-gray-800">{model.name}</p>
                <p className="text-sm text-gray-600">{model.model_number}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Components */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp) => (
              <div
                key={comp.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedComponents[comp.component_id]
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => handleSelectComponent(comp.component_id, comp)}
              >
                {comp.component?.image_url && (
                  <img
                    src={comp.component.image_url}
                    alt={comp.component.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-gray-800">
                  {comp.component?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {comp.component?.category}
                </p>

                {selectedComponents[comp.component_id] && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Price: ₹{comp.proposed_price}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantities({
                            ...quantities,
                            [comp.component_id]: Math.max(1, (quantities[comp.component_id] || 1) - 1)
                          });
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <FiMinus size={16} />
                      </button>
                      <input
                        type="number"
                        value={quantities[comp.component_id] || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantities({
                            ...quantities,
                            [comp.component_id]: Math.max(1, val)
                          });
                        }}
                        className="w-12 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantities({
                            ...quantities,
                            [comp.component_id]: (quantities[comp.component_id] || 1) + 1
                          });
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {Object.keys(selectedComponents).length > 0 && (
          <button
            onClick={handleAddToCart}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition-colors"
          >
            Add {Object.keys(selectedComponents).length} Item(s) to Cart
          </button>
        )}
      </div>
    </div>
  );
}

