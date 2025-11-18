import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending_approval');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = filterStatus === 'pending_approval' 
        ? '/vendors/requests/pending'
        : filterStatus === 'approved'
        ? '/vendors/requests/approved'
        : filterStatus === 'rejected'
        ? '/vendors/requests/rejected'
        : '/vendors/requests';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (error) {
      toast.error('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this inventory request?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendors/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Request approved! Component is now visible to customers.');
        fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vendors/requests/${selectedRequest.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        toast.success('Request rejected');
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#34c759';
      case 'pending_approval': return '#ff9500';
      case 'rejected': return '#ff3b30';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending_approval': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading vendor requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        <h2>Vendor Inventory Requests</h2>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#ff9500' }}>
            {requests.filter(r => r.status === 'pending_approval').length}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Pending Approval</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#34c759' }}>
            {requests.filter(r => r.status === 'approved').length}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Approved</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '28px', color: '#ff3b30' }}>
            {requests.filter(r => r.status === 'rejected').length}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Rejected</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Filter by Status</label>
          <select
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Requests</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>
            No {filterStatus ? getStatusText(filterStatus).toLowerCase() : ''} requests found
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Component</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Model</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                        {request.vendors?.store_name || 'N/A'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {request.vendors?.email || ''}
                      </p>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                        {request.components?.name || 'N/A'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {request.components?.category || ''}
                      </p>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                      {request.phone_models?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        backgroundColor: '#f0f0f0'
                      }}>
                        {request.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>
                      ${parseFloat(request.proposed_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: getStatusColor(request.status),
                        color: 'white'
                      }}>
                        {getStatusText(request.status)}
                      </span>
                      {request.status === 'rejected' && request.rejection_reason && (
                        <p style={{ fontSize: '11px', color: '#ff3b30', marginTop: '4px' }}>
                          {request.rejection_reason}
                        </p>
                      )}
                      {request.status === 'approved' && request.approved_at && (
                        <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                          {new Date(request.approved_at).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {request.status === 'pending_approval' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '13px', color: '#ff3b30' }}
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '24px' }}>Reject Request</h2>
            
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Vendor:</strong> {selectedRequest.vendors?.store_name}
              </p>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Component:</strong> {selectedRequest.components?.name}
              </p>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Model:</strong> {selectedRequest.phone_models?.name}
              </p>
              <p style={{ fontSize: '14px' }}>
                <strong>Price:</strong> ${parseFloat(selectedRequest.proposed_price).toFixed(2)} ({selectedRequest.quantity} units)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                className="form-input"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReject}
                style={{ flex: 1, backgroundColor: '#ff3b30' }}
                disabled={!rejectionReason.trim()}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
