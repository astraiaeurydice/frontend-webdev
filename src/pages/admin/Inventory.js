import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { isProductEvent } from '../../realtime/events';
import useRealtimeRefresh from '../../realtime/useRealtimeRefresh';
import { 
  Package, 
  Plus, 
  Edit, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Box
} from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('add'); // 'add' or 'update'
  const [quantity, setQuantity] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    activeProducts: 0
  });

  const INVENTORY_API = `${API_BASE_URL}/api/admin/inventory`;

  useEffect(() => {
    fetchProducts();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, lowStockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (lowStockFilter) params.append('lowStock', 'true');
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${INVENTORY_API}/products?${params.toString()}`, {
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch products' }));
        setError(errorData.error || 'Failed to fetch products');
        return;
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Error fetching products: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${INVENTORY_API}/statistics`, {
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
      fetchProducts();
      fetchStatistics();
    },
    payload => isProductEvent(payload?.type),
  );

  const filterProducts = () => {
    let filtered = [...products];

    // Additional client-side filtering if needed
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        (p.category && p.category.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (lowStockFilter) {
      filtered = filtered.filter(p => (p.stockQuantity || 0) < 10);
    }

    setFilteredProducts(filtered);
  };

  const handleAddStock = async () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${INVENTORY_API}/products/${selectedProduct.id}/add-stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: parseInt(quantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add stock' }));
        setError(errorData.error || 'Failed to add stock');
        return;
      }

      const data = await response.json();
      setSuccess(data.message || 'Stock added successfully');
      setShowModal(false);
      setSelectedProduct(null);
      setQuantity('');
      fetchProducts();
      fetchStatistics();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error adding stock: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || quantity === '' || parseInt(quantity) < 0) {
      setError('Please enter a valid quantity (0 or greater)');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${INVENTORY_API}/products/${selectedProduct.id}/update-stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: parseInt(quantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update stock' }));
        setError(errorData.error || 'Failed to update stock');
        return;
      }

      const data = await response.json();
      setSuccess(data.message || 'Stock updated successfully');
      setShowModal(false);
      setSelectedProduct(null);
      setQuantity('');
      fetchProducts();
      fetchStatistics();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error updating stock: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (product, type) => {
    setSelectedProduct(product);
    setActionType(type);
    setQuantity(type === 'add' ? '' : (product.stockQuantity || 0).toString());
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const getStockStatus = (stock) => {
    const stockQty = stock || 0;
    if (stockQty === 0) {
      return { color: 'text-red-600 bg-red-50 border-red-200', label: 'Out of Stock', icon: XCircle };
    } else if (stockQty < 10) {
      return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Low Stock', icon: AlertTriangle };
    } else {
      return { color: 'text-green-600 bg-green-50 border-green-200', label: 'In Stock', icon: CheckCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading inventory...</p>
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
                Inventory Management
              </h1>
              <p className="text-gray-600">Manage product stock levels</p>
            </div>
            <button
              onClick={() => { fetchProducts(); fetchStatistics(); }}
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
                  <p className="text-sm text-blue-600 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalProducts}</p>
                </div>
                <Package className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Stock</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalStock}</p>
                </div>
                <Box className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.lowStockCount}</p>
                </div>
                <AlertTriangle className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-900">{stats.outOfStockCount}</p>
                </div>
                <XCircle className="text-red-500" size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeProducts}</p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
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
                placeholder="Search products..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={lowStockFilter}
                  onChange={(e) => setLowStockFilter(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Low Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Current Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stockQuantity);
                    const StatusIcon = stockStatus.icon;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image && (
                              <img 
                                src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">₱{product.price?.toFixed(2)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {product.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {product.stockQuantity || 0}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${stockStatus.color}`}>
                              <StatusIcon size={12} />
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(product, 'add')}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <Plus size={16} />
                              Add
                            </button>
                            <button
                              onClick={() => openModal(product, 'update')}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <Edit size={16} />
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {actionType === 'add' ? 'Add Stock' : 'Update Stock'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProduct(null);
                      setQuantity('');
                      setError('');
                      setSuccess('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Product</p>
                  <p className="font-semibold text-lg">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Current Stock: <span className="font-bold text-gray-900">{selectedProduct.stockQuantity || 0}</span>
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {actionType === 'add' ? 'Quantity to Add' : 'New Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={actionType === 'add' ? '1' : '0'}
                    placeholder={actionType === 'add' ? 'Enter quantity to add' : 'Enter new stock quantity'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {actionType === 'add' && quantity && !isNaN(quantity) && (
                    <p className="text-sm text-gray-500 mt-2">
                      New stock will be: <span className="font-semibold">
                        {(selectedProduct.stockQuantity || 0) + parseInt(quantity)}
                      </span>
                    </p>
                  )}
                </div>

                {/* Error/Success in Modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <XCircle className="text-red-500" size={16} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProduct(null);
                      setQuantity('');
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={actionType === 'add' ? handleAddStock : handleUpdateStock}
                    disabled={processing || !quantity}
                    className={`flex-1 px-6 py-3 rounded-lg transition-all font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionType === 'add' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {processing ? 'Processing...' : (actionType === 'add' ? 'Add Stock' : 'Update Stock')}
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

export default Inventory;

