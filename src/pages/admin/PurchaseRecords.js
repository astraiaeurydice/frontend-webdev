import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useRef, useState, useEffect } from 'react';
import { isOrderEvent, isProductEvent } from '../../realtime/events';
import useRealtimeRefresh from '../../realtime/useRealtimeRefresh';
import { 
  ShoppingBag, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  User,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react';

const PurchaseRecords = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('complete');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalQuantity: 0,
    averageOrderValue: 0
  });
  const lastOrdersSigRef = useRef('');

  const reconcileOrders = (prev, next) => {
    const prevById = new Map(prev.map((row) => [row.id, row]));
    let changed = prev.length !== next.length;

    const merged = next.map((incoming) => {
      const existing = prevById.get(incoming.id);
      if (!existing) {
        changed = true;
        return incoming;
      }

      const same =
        existing.updatedAt === incoming.updatedAt &&
        existing.status === incoming.status &&
        existing.quantity === incoming.quantity &&
        existing.totalPrice === incoming.totalPrice;

      if (!same) {
        changed = true;
        return incoming;
      }
      return existing;
    });

    return changed ? merged : prev;
  };

  const PURCHASE_API = `${API_BASE_URL}/api/admin/purchase-records`;

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`${PURCHASE_API}?${params.toString()}`, {
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch purchase records' }));
        setError(errorData.error || 'Failed to fetch purchase records');
        return;
      }

      const data = await response.json();
      const ordersData = Array.isArray(data) ? data : [];
      const signature = ordersData.map((o) => `${o.id}:${o.updatedAt}`).join('|');
      if (signature !== lastOrdersSigRef.current) {
        setOrders((prev) => reconcileOrders(prev, ordersData));
        lastOrdersSigRef.current = signature;
        console.log('[PurchaseRecords] fetched orders:', ordersData.length, { changed: true });
      } else {
        console.log('[PurchaseRecords] fetched orders:', ordersData.length, { changed: false });
      }
      setError('');
    } catch (err) {
      setError('Error fetching purchase records: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${PURCHASE_API}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log('[PurchaseRecords] stats:', data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  useRealtimeRefresh(
    () => {
      fetchOrders(true);
      fetchStatistics();
    },
    payload => isOrderEvent(payload?.type) || isProductEvent(payload?.type),
    'PurchaseRecords',
    500,
  );

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        (o.receiptNumber || '').toLowerCase().includes(searchLower) ||
        String(o.id).includes(searchLower) ||
        o.customer.username.toLowerCase().includes(searchLower) ||
        o.customer.firstName.toLowerCase().includes(searchLower) ||
        o.customer.lastName.toLowerCase().includes(searchLower) ||
        o.product.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOrders(filtered);
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

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase records...</p>
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
                Purchase Records
              </h1>
              <p className="text-gray-600">View and manage all purchase transactions</p>
            </div>
            <button
              onClick={() => { fetchOrders(); fetchStatistics(); }}
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
                  <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completedOrders}</p>
                </div>
                <Package className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Quantity</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalQuantity}</p>
                </div>
                <Package className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Avg Order Value</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.averageOrderValue)}</p>
                </div>
                <TrendingUp className="text-yellow-500" size={24} />
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
                placeholder="Search by customer or product..."
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
                <option value="complete">Completed</option>
                <option value="pending">Pending</option>
                <option value="all">All Status</option>
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

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No purchase records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Receipt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Total Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-purple-700">
                        {order.receiptNumber || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{order.customer.username}</p>
                          <p className="text-xs text-gray-500">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          {order.product.image && (
                            <img 
                              src={order.product.image.startsWith('http') ? order.product.image : `${API_BASE_URL}${order.product.image}`}
                              alt={order.product.name}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{order.product.name}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(order.product.price)} each</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'complete' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
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
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Order Details #{selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedOrder(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-600 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-medium">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Username</p>
                        <p className="font-medium">@{selectedOrder.customer.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-medium">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-600 mb-3">Product Information</h3>
                    <div className="flex items-start gap-4">
                      {selectedOrder.product.image && (
                        <img 
                          src={selectedOrder.product.image.startsWith('http') ? selectedOrder.product.image : `${API_BASE_URL}${selectedOrder.product.image}`}
                          alt={selectedOrder.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-lg">{selectedOrder.product.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedOrder.product.category || 'No category'}</p>
                        <p className="text-sm text-gray-600">Price: {formatCurrency(selectedOrder.product.price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Order Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="font-bold text-lg">{selectedOrder.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Unit Price</p>
                        <p className="font-medium">{formatCurrency(selectedOrder.product.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Price</p>
                        <p className="font-bold text-xl text-purple-600">{formatCurrency(selectedOrder.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block mt-1 ${
                          selectedOrder.status === 'complete' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Order Date</p>
                        <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedOrder(null);
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

export default PurchaseRecords;

