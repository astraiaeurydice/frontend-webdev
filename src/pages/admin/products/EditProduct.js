import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Save, Building2, Users, Upload, X, Sparkles } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    groupId: '',
    stockQuantity: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  
  // Check if user is admin (can edit stock) or staff (read-only)
  const isAdmin = userRoles.includes('ROLE_ADMIN');
  const isStaffOnly = userRoles.includes('ROLE_STAFF') && !userRoles.includes('ROLE_ADMIN');

  const categories = ['Clothing', 'Accessories', 'Posters', 'Albums', 'Lightsticks'];

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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch groups
        const groupsRes = await fetch(`${API_BASE_URL}/api/groups`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(groupsData);
        }
        
        setLoadingGroups(false);
        
        // Fetch product
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch product');
        
        const data = await res.json();
        setProduct({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          category: data.category || '',
          groupId: data.groupId || data.group?.id || '',
          stockQuantity: data.stockQuantity || ''
        });
        
        // Set existing image
        if (data.image) {
          setExistingImage(data.image);
        }
        
        // Set supplier if group has one
        if (data.group?.supplier) {
          setSelectedSupplier(data.group.supplier);
        }
        
      } catch (err) {
        console.error(err);
        alert('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setProduct({ ...product, groupId });
    
    const selectedGroup = groups.find(g => g.id === parseInt(groupId));
    if (selectedGroup && selectedGroup.supplier) {
      setSelectedSupplier(selectedGroup.supplier);
    } else {
      setSelectedSupplier(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Determine if we need multipart/form-data or JSON
      const hasNewImage = imageFile !== null;
      
      let response;
      
      if (hasNewImage) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', parseFloat(product.price));
        formData.append('category', product.category);
        formData.append('groupId', parseInt(product.groupId));
        // Stock quantity can be edited by admin
        if (isAdmin && product.stockQuantity !== '') {
          formData.append('stockQuantity', parseInt(product.stockQuantity) || 0);
        }
        formData.append('image', imageFile);
        
        response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // Use JSON for updates without image change
        const updateData = {
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          category: product.category,
          groupId: parseInt(product.groupId),
        };
        // Stock quantity can be edited by admin
        if (isAdmin && product.stockQuantity !== '') {
          updateData.stockQuantity = parseInt(product.stockQuantity) || 0;
        }
        
        response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
      
      const result = await response.json();
      
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
            action: 'UPDATE',
            targetData: JSON.stringify({
              entity: 'Product',
              entity_id: id,
              entity_name: product.name
            })
          })
        });
        console.log('✅ Product UPDATE logged to activity logs');
      } catch (logError) {
        console.error('❌ Failed to log activity:', logError);
      }
      
      alert('Product updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white">Edit Product</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm resize-none"
                placeholder="Enter product description"
              />
            </div>

            {/* Category and Group Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Group Selection */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  K-Pop Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="groupId"
                  value={product.groupId}
                  onChange={handleGroupChange}
                  required
                  disabled={loadingGroups}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingGroups ? 'Loading groups...' : 'Select a group'}
                  </option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.debutYear && `(${g.debutYear})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-filled Supplier Display */}
            {selectedSupplier && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Building2 className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                        Entertainment Company
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                        Auto-Selected
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {selectedSupplier.companyName || selectedSupplier.name}
                    </h4>
                    {selectedSupplier.email && (
                      <p className="text-sm text-gray-600">📧 {selectedSupplier.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm">₱</span>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Stock Quantity - Editable for Admin, Read Only for Staff */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Stock Quantity {isAdmin ? '' : '(Read Only)'}
                </label>
                {isAdmin ? (
                  <input
                    type="number"
                    name="stockQuantity"
                    value={product.stockQuantity || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                    placeholder="0"
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      value={product.stockQuantity || 0}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium text-sm cursor-not-allowed"
                      placeholder="0"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded border">Read Only</span>
                    </div>
                  </div>
                )}
                {isStaffOnly && (
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    💡 To update stock, use the <span className="text-purple-600 font-semibold">Stock Request</span> system
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Product Image
              </label>
              
              {!imagePreview && existingImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Current Image:</p>
                  <img
                    src={`${API_BASE_URL}${existingImage}`}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-4 bg-purple-100 rounded-full">
                      <Upload className="w-8 h-8 text-purple-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold mb-1">
                        {existingImage ? 'Click to replace image' : 'Click to upload product image'}
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, GIF or WEBP (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 bg-gradient-to-r from-pink-500 to-red-500 hover:shadow-md text-white rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <div className="mt-2 text-sm text-gray-600 font-medium">
                    {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || loadingGroups}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={1.5} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                disabled={saving}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;