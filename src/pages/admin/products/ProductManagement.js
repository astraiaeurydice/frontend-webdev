import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Eye, Package } from 'lucide-react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { isProductEvent } from '../../../realtime/events';
import useRealtimeRefresh from '../../../realtime/useRealtimeRefresh';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useRealtimeRefresh(fetchProducts, payload => isProductEvent(payload?.type));

  useEffect(() => {
    if (!loading && products.length > 0 && tableRef.current) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }

      dataTableRef.current = $(tableRef.current).DataTable({
        pageLength: 10,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
        order: [[0, 'asc']],
        columnDefs: [
          { orderable: false, targets: [1, 8] },
          { searchable: false, targets: [1, 8] }
        ],
        language: {
          search: "Search:",
          lengthMenu: "Show _MENU_ products",
          info: "Showing _START_ to _END_ of _TOTAL_ products",
          infoEmpty: "No products available",
          infoFiltered: "(filtered from _MAX_ total products)",
          paginate: {
            first: "First",
            last: "Last",
            next: "Next",
            previous: "Previous"
          }
        },
        dom: '<"flex flex-col md:flex-row justify-between items-center mb-4 gap-4"lf>rtip',
        drawCallback: function() {
          attachEventListeners();
        }
      });

      attachEventListeners();
    }

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [loading, products]);

  const attachEventListeners = () => {
    document.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.onclick = () => handleView(btn.dataset.id);
    });
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.onclick = () => handleEdit(btn.dataset.id);
    });
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.onclick = () => handleDelete(btn.dataset.id);
    });
  };

  const handleView = (id) => navigate(`/admin/products/view/${id}`);
  const handleEdit = (id) => navigate(`/admin/products/edit/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const token = localStorage.getItem('token') || '';
      
      // Get product name before deleting for logging
      const productToDelete = products.find(p => p.id === id);
      const productName = productToDelete ? productToDelete.name : `Product #${id}`;
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete product');
      }

      // Log activity to activity logs
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await fetch(`${API_BASE_URL}/api/activity-logs/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'DELETE',
            targetData: JSON.stringify({
              entity: 'Product',
              entity_id: id,
              entity_name: productName
            })
          })
        });
        console.log('✅ Product DELETE logged to activity logs');
      } catch (logError) {
        console.error('❌ Failed to log activity:', logError);
      }

      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
      
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product: ' + err.message);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300',
      inactive: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
      discontinued: 'bg-gradient-to-r from-pink-100 to-red-100 text-pink-700 border-pink-300'
    };
    
    return `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[status] || statusStyles.active}">
      ${(status || 'ACTIVE').toUpperCase()}
    </span>`;
  };

  const getStockBadge = (stockQuantity) => {
    const stock = stockQuantity ?? 0;
    
    if (stock === 0) {
      return `<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-100 to-red-100 border border-pink-300">
        <div class="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse shadow-sm"></div>
        <span class="text-sm font-bold text-pink-700">${stock}</span>
      </div>`;
    }
    
    if (stock < 10) {
      return `<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300">
        <div class="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
        <span class="text-sm font-bold text-purple-700">${stock}</span>
      </div>`;
    }
    
    return `<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300">
      <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
      <span class="text-sm font-bold text-blue-700">${stock}</span>
    </div>`;
  };

  const getImageHTML = (product) => {
    const imageUrl = getImageUrl(product.image);
    if (imageUrl) {
      return `<img src="${imageUrl}" alt="${product.name}" class="w-14 h-14 object-cover rounded-xl border-2 border-purple-200 shadow-sm" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="w-14 h-14 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-xl flex items-center justify-center border-2 border-purple-300 shadow-sm" style="display:none;">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        </div>`;
    }
    return `<div class="w-14 h-14 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-xl flex items-center justify-center border-2 border-purple-300 shadow-sm">
      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
    </div>`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-tight mb-1">
              Product Management
            </h2>
            <p className="text-gray-600 font-medium text-sm">Manage your K-pop merchandise inventory</p>
          </div>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-md"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Product
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Products Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 animate-pulse"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg">
                  <Package className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-white drop-shadow-sm">All Products</h3>
              </div>
              <span className="px-4 py-2 bg-white/25 backdrop-blur-sm rounded-xl text-sm font-bold text-white shadow-lg">
                {products.length} products
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4 shadow-lg"></div>
                <p className="text-gray-600 font-semibold text-lg">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                <Package className="w-8 h-8 text-purple-400" strokeWidth={2} />
              </div>
              <p className="text-gray-500 font-semibold">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-6">
              <table ref={tableRef} className="w-full display" style={{width: '100%'}}>
                <thead>
                  <tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Image</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Group</th>
                    <th className="text-left">Category</th>
                    <th className="text-left">Price</th>
                    <th className="text-left">Stock</th>
                    <th className="text-left">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <span className="font-mono text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">#{product.id}</span>
                      </td>
                      <td dangerouslySetInnerHTML={{ __html: getImageHTML(product) }} />
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {product.name}
                          </span>
                          {product.subcategory && (
                            <span className="text-xs text-gray-500 mt-0.5 font-medium">{product.subcategory}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700 font-semibold">
                          {product.group?.name || product.groupName || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700 font-semibold">
                          {product.category || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₱{product.price?.toFixed(2)}</span>
                      </td>
                      <td dangerouslySetInnerHTML={{ __html: getStockBadge(product.stockQuantity) }} />
                      <td dangerouslySetInnerHTML={{ __html: getStatusBadge(product.status) }} />
                      <td>
                        <div className="flex gap-2 justify-center">
                          <button
                            data-action="view"
                            data-id={product.id}
                            className="p-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:scale-110 transition-all duration-200"
                            title="View"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <button
                            data-action="edit"
                            data-id={product.id}
                            className="p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:scale-110 transition-all duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <button
                            data-action="delete"
                            data-id={product.id}
                            className="p-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-110 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
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
      </div>

      <style>{`
        /* DataTables custom styling with gradient theme */
        .dataTables_wrapper .dataTables_length {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dataTables_wrapper .dataTables_length label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b21a8;
        }

        .dataTables_wrapper .dataTables_length select {
          padding: 0.625rem 2.5rem 0.625rem 1rem;
          border: 2px solid #e9d5ff;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          background: linear-gradient(to right, #faf5ff, #fdf4ff);
          color: #6b21a8;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(147, 51, 234, 0.1);
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239333ea'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1.25rem;
          appearance: none;
        }
        
        .dataTables_wrapper .dataTables_length select:hover {
          border-color: #c084fc;
          box-shadow: 0 4px 12px rgba(192, 132, 252, 0.3);
          transform: translateY(-1px);
        }

        .dataTables_wrapper .dataTables_length select:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
        }

        .dataTables_wrapper .dataTables_filter label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b21a8;
        }
        
        .dataTables_wrapper .dataTables_filter input {
          padding: 0.625rem 1rem;
          border: 2px solid #e9d5ff;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          margin-left: 0;
          transition: all 0.3s;
          color: #6b21a8;
          background: linear-gradient(to right, #faf5ff, #fdf4ff);
          box-shadow: 0 2px 4px rgba(147, 51, 234, 0.1);
          min-width: 250px;
        }
        
        .dataTables_wrapper .dataTables_filter input:hover {
          border-color: #c084fc;
          box-shadow: 0 4px 12px rgba(192, 132, 252, 0.3);
          transform: translateY(-1px);
        }

        .dataTables_wrapper .dataTables_filter input:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
        }

        .dataTables_wrapper .dataTables_filter input::placeholder {
          color: #c084fc;
        }
        
        .dataTables_wrapper .dataTables_info {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b21a8;
          padding: 0.75rem 1rem;
          background: linear-gradient(to right, #f3e8ff, #fce7f3);
          border-radius: 1rem;
          border: 2px solid #e9d5ff;
          display: inline-block;
        }

        .dataTables_wrapper .dataTables_paginate {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .dataTables_wrapper .dataTables_paginate .paginate_button {
          padding: 0.625rem 1rem;
          margin: 0;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          border: 2px solid #e9d5ff;
          transition: all 0.3s;
          background: linear-gradient(to right, #faf5ff, #fdf4ff);
          color: #6b21a8 !important;
          box-shadow: 0 2px 4px rgba(147, 51, 234, 0.1);
          cursor: pointer;
        }

        .dataTables_wrapper .dataTables_paginate .paginate_button.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f3f4f6;
          border-color: #e5e7eb;
        }
        
        .dataTables_wrapper .dataTables_paginate .paginate_button.current {
          background: linear-gradient(to right, #9333ea, #ec4899, #3b82f6) !important;
          color: white !important;
          border: none;
          box-shadow: 0 6px 12px rgba(147, 51, 234, 0.4);
          transform: scale(1.05);
        }
        
        .dataTables_wrapper .dataTables_paginate .paginate_button:hover:not(.disabled):not(.current) {
          background: linear-gradient(to right, #e9d5ff, #fbcfe8, #dbeafe);
          border-color: #c084fc;
          color: #6b21a8 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(192, 132, 252, 0.4);
        }

        .dataTables_wrapper .dataTables_paginate .ellipsis {
          padding: 0.625rem 1rem;
          color: #9333ea;
          font-weight: 700;
        }
        
        table.dataTable thead th {
          padding: 1rem 1.5rem;
          background: linear-gradient(to right, #f3e8ff, #fce7f3, #dbeafe);
          border-bottom: 2px solid #e9d5ff;
          font-size: 0.75rem;
          font-weight: 700;
          color: #6b21a8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        table.dataTable tbody td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3e8ff;
        }
        
        table.dataTable tbody tr:hover {
          background: linear-gradient(to right, #faf5ff, #fdf4ff, #eff6ff);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;