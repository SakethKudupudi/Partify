import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiShoppingCart } from 'react-icons/fi';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/brands`
      );
      setBrands(response.data);
    } catch (error) {
      toast.error('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Phone Brands
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer p-6"
              onClick={() => setSelectedBrand(brand)}
            >
              {brand.image_url && (
                <img
                  src={brand.image_url}
                  alt={brand.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-800">{brand.name}</h2>
              <p className="text-gray-600 mt-2">{brand.description}</p>
              <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                View Models
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

