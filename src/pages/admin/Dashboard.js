import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { REALTIME_EVENT, isOrderEvent, isProductEvent, isTradeEvent } from '../../realtime/events';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, ArrowUp, ArrowDown, ShoppingCart, Package,
  Clock, FileText, Send, TrendingUp, AlertCircle, Sparkles,
  Box, Eye, Search, Filter, ArrowRightLeft
} from 'lucide-react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import DashboardCharts from '../../components/admin/DashboardCharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalTrades: 0,
    pendingTrades: 0,
    lowStockCount: 0,
    stockRequestsCount: 0
  });
  
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const refreshRef = useRef(() => {});

  useEffect(() => {
    // Get user roles from localStorage
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      try {
        const roles = JSON.parse(storedRoles);
        setUserRoles(Array.isArray(roles) ? roles : [roles]);
      } catch (e) {
        setUserRoles([storedRoles]);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [userRoles]);

  useEffect(() => {
    if (!loading && stockRequests.length > 0 && tableRef.current) {
      // Destroy existing DataTable instance if it exists
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }

      // Initialize DataTable
      dataTableRef.current = $(tableRef.current).DataTable({
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        order: [[0, 'desc']], // Sort by ID descending (newest first)
        columnDefs: [
          { orderable: true, targets: '_all' }
        ],
        language: {
          search: "_INPUT_",
          searchPlaceholder: "Search requests...",
          lengthMenu: "Show _MENU_ entries",
          info: "Showing _START_ to _END_ of _TOTAL_ requests",
          infoEmpty: "Showing 0 to 0 of 0 requests",
          infoFiltered: "(filtered from _MAX_ total requests)",
          paginate: {
            first: "First",
            last: "Last",
            next: "Next",
            previous: "Previous"
          }
        },
        dom: '<"datatable-header"lf>rt<"datatable-footer"ip>',
        drawCallback: function() {
          $('.dataTables_wrapper').css({
            'padding': '0'
          });
        }
      });

      // Add custom styling
      const style = document.createElement('style');
      style.innerHTML = `
        .dataTables_wrapper {
          font-family: inherit !important;
        }
        .datatable-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          gap: 1rem;
          flex-wrap: wrap;
          background-color: #f9fafb;
        }
        .dataTables_length {
          display: flex;  
          align-items: center;
          gap: 0.5rem;
        }
        .dataTables_length label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .dataTables_length select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: white;
          cursor: pointer;
        }
        .dataTables_filter {
          display: flex;
          align-items: center;
        }
        .dataTables_filter label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .dataTables_filter input {
          padding: 0.625rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          min-width: 250px;
        }
        .dataTables_filter input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #9333ea;
          border-color: transparent;
        }
        .datatable-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dataTables_info {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }
        .dataTables_paginate {
          display: flex;
          gap: 0.25rem;
        }
        .dataTables_paginate .paginate_button {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }
        .dataTables_paginate .paginate_button:hover:not(.disabled) {
          background: linear-gradient(to right, #ec4899, #9333ea);
          color: white;
          border-color: transparent;
        }
        .dataTables_paginate .paginate_button.current {
          background: linear-gradient(to right, #ec4899, #9333ea);
          color: white;
          border-color: transparent;
        }
        .dataTables_paginate .paginate_button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        table.dataTable thead th {
          border-bottom: none !important;
        }
        table.dataTable tbody td {
          border-bottom: 1px solid #f3f4f6 !important;
        }
        table.dataTable tbody tr:hover {
          background-color: #eff6ff !important;
        }
      `;
      if (!document.getElementById('datatable-custom-styles')) {
        style.id = 'datatable-custom-styles';
        document.head.appendChild(style);
      }
    }

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [loading, stockRequests, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      };

      // Fetch dashboard statistics
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard/statistics`, { headers });
      if (statsResponse.status === 401 || statsResponse.status === 403) {
        // Mirror customer dashboard behavior on auth failure
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        navigate('/login', { replace: true });
        return;
      }
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
        console.log('[AdminDashboard] stats:', statsData);
      }

      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`, { headers });
      const productsData = await productsResponse.json();
      console.log('[AdminDashboard] products fetched:', Array.isArray(productsData) ? productsData.length : 0);
      
      // Sort by ID descending to get recent products
      const sortedProducts = [...productsData].sort((a, b) => b.id - a.id);
      const recentProds = sortedProducts.slice(0, 5);
      
      // Filter low stock products (stock < 10)
      const lowStock = productsData.filter(p => (p.stockQuantity || 0) < 10).slice(0, 5);
      
      // Fetch stock requests only for staff (not admin)
      const isStaff = userRoles.includes('ROLE_STAFF') && !userRoles.includes('ROLE_ADMIN');
      if (isStaff) {
        const stockReqResponse = await fetch(`${API_BASE_URL}/api/stock-requests`, { headers });
        const stockReqData = await stockReqResponse.json();
        
        // Sort stock requests by date (most recent first)
        const sortedRequests = [...stockReqData].sort((a, b) => 
          new Date(b.requestDate || b.createdAt) - new Date(a.requestDate || a.createdAt)
        );
        setStockRequests(sortedRequests);
        console.log('[AdminDashboard] stock requests fetched:', sortedRequests.length);
      } else {
        setStockRequests([]);
      }
      
      setRecentProducts(recentProds);
      setLowStockProducts(lowStock);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  refreshRef.current = fetchDashboardData;

  useEffect(() => {
    const onRealtime = event => {
      const payload = event?.detail;
      const type = payload?.type;
      if (isProductEvent(type) || isTradeEvent(type) || isOrderEvent(type) || type === 'stock_request_created') {
        console.log('[AdminDashboard] refresh by', type);
        refreshRef.current();
      }
    };
    window.addEventListener(REALTIME_EVENT, onRealtime);
    return () => window.removeEventListener(REALTIME_EVENT, onRealtime);
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'accepted': 
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'processing':
      case 'pending': 
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'shipped': 
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'declined':
      case 'rejected': 
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default: 
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const filteredRequests = stockRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || 
      (request.status?.toLowerCase() || 'pending') === statusFilter.toLowerCase();
    
    return matchesStatus;
  });

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="relative bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all duration-200 overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500`}></div>
      <div className="relative">
        <div className={`inline-flex p-2.5 rounded-xl ${color} bg-opacity-10 mb-4`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-2 border-purple-300 border-t-purple-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Dashboard
            </h2>
            <p className="text-gray-500 font-medium text-sm">Manage your K-pop merch empire</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium text-sm">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Export
            </button>
            <button
              onClick={() => navigate('/admin/stock-request')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium text-sm"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              New Request
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1600px] mx-auto">
        <DashboardCharts />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={Package}
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Active merchandise"
            color="bg-purple-500"
          />
          <StatCard 
            icon={DollarSign}
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="All purchase orders"
            color="bg-blue-500"
          />
          <StatCard 
            icon={ArrowRightLeft}
            title="Total Trades"
            value={stats.totalTrades}
            subtitle="All trade transactions"
            color="bg-cyan-500"
          />
          <StatCard 
            icon={Clock}
            title="Pending Trades"
            value={stats.pendingTrades}
            subtitle="Awaiting verification"
            color="bg-purple-500"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recently Added Products - Left */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Recently Added</h3>
                </div>
                <button 
                  onClick={() => navigate('/admin/products')}
                  className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all font-medium text-sm"
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="p-5">
              {recentProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-gray-400 font-medium">No products yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProducts.map((product, index) => (
                    <div key={product.id} className="relative flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                      {/* NEW Badge for most recent */}
                      {index === 0 && (
                        <div className="absolute -top-1 -left-1 z-10">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-sm opacity-75 animate-pulse"></div>
                            <div className="relative px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-white" strokeWidth={2} />
                              <span className="text-[10px] font-bold text-white uppercase tracking-wide">New</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {getImageUrl(product.image) ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <Package className="w-6 h-6 text-purple-400" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{product.category || 'No category'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-purple-600">₱{product.price?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Stock: {product.stockQuantity || 0}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/products/view/${product.id}`)}
                        className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert - Right */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Low Stock Alert</h3>
                </div>
                <span className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-sm font-bold text-white">
                  {lowStockProducts.length} items
                </span>
              </div>
            </div>
            <div className="p-5">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-gray-400 font-medium">All products well stocked! 🎉</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                      {getImageUrl(product.image) ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <Package className="w-6 h-6 text-pink-400" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{product.category || 'No category'}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm ${
                          product.stockQuantity === 0 
                            ? 'bg-pink-50 text-pink-700 border border-pink-200' 
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            product.stockQuantity === 0 ? 'bg-pink-500 animate-pulse' : 'bg-purple-500'
                          }`}></div>
                          <span>{product.stockQuantity || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          {product.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/products/view/${product.id}`)}
                        className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Requests Table - Full Width (Staff Only) */}
        {userRoles.includes('ROLE_STAFF') && !userRoles.includes('ROLE_ADMIN') && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white">Stock Requests</h3>
              </div>
              
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-gray-400 font-medium text-lg">
                  {statusFilter !== 'all' ? 'No matching requests found' : 'No stock requests yet'}
                </p>
              </div>
            ) : (
              <table ref={tableRef} className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-blue-600">#{request.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{request.product?.name || request.productName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">{request.supplier?.name || request.supplierName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{request.quantity || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(request.status)}`}>
                          {request.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-medium">
                          {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 
                           request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
