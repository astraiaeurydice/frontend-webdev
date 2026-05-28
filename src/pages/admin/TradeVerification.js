import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { REALTIME_EVENT, isTradeEvent } from '../../realtime/events';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  FileText,
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';

const TradeVerification = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'verify' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    completed: 0,
    rejected: 0
  });

  const TRADES_API = `${API_BASE_URL}/api/admin/trades`;

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
  }, [statusFilter]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const endpoint = statusFilter === 'all' 
        ? `${TRADES_API}/transactions`
        : `${TRADES_API}/transactions?status=${statusFilter}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch transactions' }));
        setError(errorData.error || 'Failed to fetch transactions');
        return;
      }

      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Error fetching transactions: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${TRADES_API}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  useEffect(() => {
    const onRealtime = event => {
      const type = event?.detail?.type;
      if (isTradeEvent(type)) {
        console.log('[TradeVerification] refresh by', type);
        fetchTransactions();
        fetchStatistics();
      }
    };
    window.addEventListener(REALTIME_EVENT, onRealtime);
    return () => window.removeEventListener(REALTIME_EVENT, onRealtime);
  }, [statusFilter]);

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by status (already handled by API, but keep for client-side search)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.owner.username.toLowerCase().includes(searchLower) ||
        t.requester.username.toLowerCase().includes(searchLower) ||
        t.owner.firstName.toLowerCase().includes(searchLower) ||
        t.owner.lastName.toLowerCase().includes(searchLower) ||
        t.requester.firstName.toLowerCase().includes(searchLower) ||
        t.requester.lastName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleVerify = async () => {
    if (!selectedTransaction) return;

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${TRADES_API}/transactions/${selectedTransaction.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: adminNotes || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to verify transaction' }));
        setError(errorData.error || 'Failed to verify transaction');
        return;
      }

      setShowModal(false);
      setSelectedTransaction(null);
      setAdminNotes('');
      fetchTransactions();
      fetchStatistics();
    } catch (err) {
      setError('Error verifying transaction: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;

    if (!adminNotes.trim()) {
      setError('Admin notes are required when rejecting a transaction');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${TRADES_API}/transactions/${selectedTransaction.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: adminNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to reject transaction' }));
        setError(errorData.error || 'Failed to reject transaction');
        return;
      }

      setShowModal(false);
      setSelectedTransaction(null);
      setAdminNotes('');
      fetchTransactions();
      fetchStatistics();
    } catch (err) {
      setError('Error rejecting transaction: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (transaction, type) => {
    setSelectedTransaction(transaction);
    setActionType(type);
    setAdminNotes('');
    setError('');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_verification': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'verified': 'bg-green-100 text-green-800 border-green-300',
      'completed': 'bg-blue-100 text-blue-800 border-blue-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    
    const labels = {
      'pending_verification': 'Pending Verification',
      'verified': 'Verified',
      'completed': 'Completed',
      'rejected': 'Rejected'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Trade Verification
              </h1>
              <p className="text-gray-600">Review and verify trade transactions</p>
            </div>
            <button
              onClick={() => { fetchTransactions(); fetchStatistics(); }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <TrendingUp className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Verified</p>
                  <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
                </div>
                <CheckCircle className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <XCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by username or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Requester</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{transaction.owner.username}</p>
                          <p className="text-xs text-gray-500">{transaction.owner.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{transaction.requester.username}</p>
                          <p className="text-xs text-gray-500">{transaction.requester.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.status === 'pending_verification' && (
                            <>
                              <button
                                onClick={() => openModal(transaction, 'verify')}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <CheckCircle size={16} />
                                Verify
                              </button>
                              <button
                                onClick={() => openModal(transaction, 'reject')}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowModal(true);
                              setActionType('view');
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {actionType === 'verify' && 'Verify Transaction'}
                    {actionType === 'reject' && 'Reject Transaction'}
                    {actionType === 'view' && 'Transaction Details'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTransaction(null);
                      setAdminNotes('');
                      setError('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium mb-1">Owner</p>
                      <p className="font-semibold">{selectedTransaction.owner.username}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.owner.email}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium mb-1">Requester</p>
                      <p className="font-semibold">{selectedTransaction.requester.username}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.requester.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created At</p>
                    <p className="font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  {selectedTransaction.verifiedAt && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Verified At</p>
                      <p className="font-medium">{formatDate(selectedTransaction.verifiedAt)}</p>
                    </div>
                  )}
                  {selectedTransaction.adminNotes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                      <p className="font-medium bg-gray-50 p-3 rounded-lg">{selectedTransaction.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Action Form */}
                {(actionType === 'verify' || actionType === 'reject') && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows="4"
                      placeholder={actionType === 'reject' ? 'Reason for rejection (required)' : 'Optional notes'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={actionType === 'reject'}
                    />
                  </div>
                )}

                {/* Error in Modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={16} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTransaction(null);
                      setAdminNotes('');
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  {actionType === 'verify' && (
                    <button
                      onClick={handleVerify}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Verify Transaction'}
                    </button>
                  )}
                  {actionType === 'reject' && (
                    <button
                      onClick={handleReject}
                      disabled={processing || !adminNotes.trim()}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Reject Transaction'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeVerification;

