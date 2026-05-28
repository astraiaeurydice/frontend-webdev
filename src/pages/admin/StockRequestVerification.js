import React, { useEffect, useState } from 'react';
import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import { isProductEvent } from '../../realtime/events';
import useRealtimeRefresh from '../../realtime/useRealtimeRefresh';
import { 
  Package, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle,
  Filter, Search, Eye, DollarSign, Calendar, Trash2, RefreshCw
} from 'lucide-react';

export default function StockRequestVerification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = (localStorage.getItem('token') || '').trim();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-requests`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useRealtimeRefresh(
    fetchRequests,
    payload => isProductEvent(payload?.type),
    'StockRequestVerification',
  );

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} request`);
      }
      const result = await response.json();
      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: newStatus } : r));
      showAlert('success', result.message || `Request ${newStatus} successfully!`);
      setSelectedRequest(null);
    } catch (err) {
      showAlert('error', err.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete request');
      }
      setRequests(reqs => reqs.filter(r => r.id !== id));
      showAlert('success', 'Request deleted successfully!');
      setDeleteConfirm(null);
      setSelectedRequest(null);
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete request');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending':   'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
      'accepted':  'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      'declined':  'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white',
      'completed': 'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    };
    return badges[status?.toLowerCase()] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white';
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':   return <Clock className="w-4 h-4" />;
      case 'accepted':  return <CheckCircle className="w-4 h-4" />;
      case 'declined':  return <XCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      default:          return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = !filterStatus || req.status?.toLowerCase() === filterStatus;
    const matchesSearch = !searchTerm ||
      req.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status?.toLowerCase() === 'pending').length,
    accepted: requests.filter(r => r.status?.toLowerCase() === 'accepted').length,
    declined: requests.filter(r => r.status?.toLowerCase() === 'declined').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
            Stock Request Verification
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Review and manage incoming stock requests</p>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {alert.type === 'success'
            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-400 to-orange-400' },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Declined', value: stats.declined, icon: XCircle, color: 'from-red-500 to-pink-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Filter className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Filter Requests</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus(''); fetchRequests(); }}
                className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2"><Package className="w-4 h-4" />Product</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Unit Price</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Date</div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No requests found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req, index) => (
                    <tr
                      key={req.id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-700">#{req.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {req.product?.name || req.productName || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{req.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {req.unitPrice ? `₱${parseFloat(req.unitPrice).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-700">
                        {req.unitPrice && req.quantity
                          ? `₱${(parseFloat(req.unitPrice) * parseInt(req.quantity)).toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(req.status)}>
                          {req.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status?.toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(req.id, 'accept')}
                                disabled={actionLoading === req.id}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all disabled:opacity-50"
                                title="Accept"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(req.id, 'decline')}
                                disabled={actionLoading === req.id}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                                title="Decline"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredRequests.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredRequests.length}</span> request{filteredRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Request Details
                </h2>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-semibold">Request ID</span>
                    <span className="font-mono text-lg font-bold text-purple-700">#{selectedRequest.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-semibold">Status</span>
                    <span className={`inline-flex items-center gap-1.5 ${getStatusBadge(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Product', value: selectedRequest.product?.name || selectedRequest.productName || 'Unknown', icon: Package },
                    { label: 'Quantity', value: selectedRequest.quantity, icon: Package },
                    { label: 'Unit Price', value: selectedRequest.unitPrice ? `₱${parseFloat(selectedRequest.unitPrice).toFixed(2)}` : 'N/A', icon: DollarSign },
                    { label: 'Total Amount', value: selectedRequest.unitPrice && selectedRequest.quantity ? `₱${(parseFloat(selectedRequest.unitPrice) * parseInt(selectedRequest.quantity)).toFixed(2)}` : 'N/A', icon: DollarSign },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-500 font-semibold">{label}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">{value}</p>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-500 font-semibold">Created Date</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedRequest.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Notes</p>
                    <p className="text-gray-800">{selectedRequest.notes}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  {selectedRequest.status?.toLowerCase() === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(selectedRequest.id, 'accept')}
                        disabled={actionLoading === selectedRequest.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(selectedRequest.id, 'decline')}
                        disabled={actionLoading === selectedRequest.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" /> Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setDeleteConfirm(selectedRequest.id); setSelectedRequest(null); }}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Request?</h2>
              <p className="text-gray-600">Are you sure you want to delete request #{deleteConfirm}? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === deleteConfirm ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Deleting...</>
                ) : (
                  <><Trash2 className="w-5 h-5" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}