import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendor-requests/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/vendor-requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request approved');
      fetchRequests();
      setShowDetails(false);
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/vendor-requests/${id}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request rejected');
      setRejectReason('');
      setShowRejectForm(null);
      fetchRequests();
      setShowDetails(false);
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Vendor Requests ({requests.length})
      </h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {request.vendors?.store_name}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1">
                    {request.phone_models?.name} - {request.components?.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Category: {request.components?.category}
                  </p>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Quantity</p>
                  <p className="text-2xl font-bold text-gray-800">{request.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Proposed Price</p>
                  <p className="text-2xl font-bold text-gray-800">₹{request.proposed_price}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{request.quantity * request.proposed_price}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDetails(true);
                  }}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FiEye size={16} /> View Details
                </button>
                <button
                  onClick={() => handleApprove(request.id)}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <FiCheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(request.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <FiXCircle size={16} /> Reject
                </button>
              </div>

              {showRejectForm === request.id && (
                <div className="mt-4 bg-red-50 p-4 rounded-lg">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full px-3 py-2 border border-red-300 rounded-lg mb-3"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Submit Rejection
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(null);
                        setRejectReason('');
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

