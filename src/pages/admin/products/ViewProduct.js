import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Users, Building2, Tag, Box, Edit, Eye } from 'lucide-react';

const ViewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold mb-4">Product not found</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all font-semibold text-sm"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-[1200px] mx-auto">
        
        {/* View Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Eye className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white">Product Details</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Product Image */}
            {product.image && (
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 text-sm">
                  Product Image
                </label>
                <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={`${API_BASE_URL}${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Product Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Product Name
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-900 font-medium text-base">{product.name}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Description
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[100px]">
                <p className="text-gray-900 font-medium text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Category and Group Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                  <Tag className="w-4 h-4" strokeWidth={1.5} />
                  Category
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900 font-medium text-sm">{product.category}</p>
                </div>
              </div>

              {/* Product ID */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Product ID
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900 font-medium text-sm">#{product.id}</p>
                </div>
              </div>
            </div>

            {/* K-Pop Group */}
            {product.group && (
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  K-Pop Group
                </label>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-base font-bold text-gray-900 mb-1">
                    {product.group.name}
                  </p>
                  {product.group.debutYear && (
                    <p className="text-sm text-gray-600">Debut Year: {product.group.debutYear}</p>
                  )}
                </div>
              </div>
            )}

            {/* Entertainment Company */}
            {product.group?.supplier && (
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                  <Building2 className="w-4 h-4" strokeWidth={1.5} />
                  Entertainment Company
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-base font-bold text-gray-900 mb-1">
                    {product.group.supplier.companyName || product.group.supplier.name}
                  </p>
                  {product.group.supplier.email && (
                    <p className="text-sm text-gray-600">📧 {product.group.supplier.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Price */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Price
                </label>
                <div className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₱{product.price}
                  </p>
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                  <Box className="w-4 h-4" strokeWidth={1.5} />
                  Stock Quantity
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-900 font-medium text-sm">{product.stockQuantity || 0} units</p>
                </div>
              </div>
            </div>

            {/* No Image Message */}
            {!product.image && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-6">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-500 font-medium">No image available for this product</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 font-semibold text-sm"
              >
                <Edit className="w-4 h-4" strokeWidth={1.5} />
                Edit Product
              </button>
              <button
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;