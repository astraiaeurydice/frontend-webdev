import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { isTradeEvent } from '../../realtime/events';
import useRealtimeRefresh from '../../realtime/useRealtimeRefresh';
import { 
  ArrowRightLeft, 
  Search, 
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Eye,
  FileText,
  RefreshCw,
  User
} from 'lucide-react';

const TradingHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    completed: 0,
    rejected: 0,
    verifiedCount: 0,
    completedCount: 0,
    totalActive: 0
  });

  const TRADING_API = `${API_BASE_URL}/api/admin/trading-history`;

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`${TRADING_API}?${params.toString()}`, {
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch trading history' }));
        setError(errorData.error || 'Failed to fetch trading history');
        return;
      }

      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Error fetching trading history: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${TRADING_API}/statistics`, {
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

  useRealtimeRefresh(
    () => {
      fetchTransactions();
      fetchStatistics();
    },
    payload => isTradeEvent(payload?.type),
  );

  const filterTransactions = () => {
    let filtered = [...transactions];

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
          <p className="text-gray-600">Loading trading history...</p>
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
                Trading History
              </h1>
              <p className="text-gray-600">View all trade transactions and their status</p>
            </div>
            <button
              onClick={() => { fetchTransactions(); fetchStatistics(); }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
            >
              <RefreshCw size={20} />
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
                <ArrowRightLeft className="text-blue-500" size={24} />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <FileText className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowRightLeft className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No trading history found</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Verified By</th>
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.verifiedBy ? transaction.verifiedBy.username : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Trade Transaction #{selectedTransaction.id}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTransaction(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>

                  {/* Users */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-600 mb-3">Owner</h3>
                      <p className="font-medium">{selectedTransaction.owner.firstName} {selectedTransaction.owner.lastName}</p>
                      <p className="text-sm text-gray-600">@{selectedTransaction.owner.username}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedTransaction.owner.email}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-purple-600 mb-3">Requester</h3>
                      <p className="font-medium">{selectedTransaction.requester.firstName} {selectedTransaction.requester.lastName}</p>
                      <p className="text-sm text-gray-600">@{selectedTransaction.requester.username}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedTransaction.requester.email}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Timeline</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                      </div>
                      {selectedTransaction.verifiedAt && (
                        <div>
                          <p className="text-xs text-gray-500">Verified At</p>
                          <p className="font-medium">{formatDate(selectedTransaction.verifiedAt)}</p>
                        </div>
                      )}
                      {selectedTransaction.verifiedBy && (
                        <div>
                          <p className="text-xs text-gray-500">Verified By</p>
                          <p className="font-medium">{selectedTransaction.verifiedBy.username}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedTransaction.adminNotes && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="text-sm font-semibold text-yellow-600 mb-2">Admin Notes</h3>
                      <p className="text-sm text-gray-700">{selectedTransaction.adminNotes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTransaction(null);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingHistory;

