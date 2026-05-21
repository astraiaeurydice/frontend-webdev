import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../../config/api';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Sparkles, Building2, Users, Upload, X } from 'lucide-react';

const NewProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [groups, setGroups] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const categories = ['Clothing', 'Accessories', 'Posters', 'Albums', 'Lightsticks'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || 'dummy-token';
        
        const groupsRes = await fetch(`${API_BASE_URL}/api/groups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(groupsData);
        }
        
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchData();
  }, []);

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    
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
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
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
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', parseFloat(price));
      formData.append('category', category);
      formData.append('groupId', parseInt(selectedGroupId));
      formData.append('stockQuantity', parseInt(stock) || 0);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const result = await res.json();
      
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
            action: 'CREATE',
            targetData: JSON.stringify({
              entity: 'Product',
              entity_id: result.id,
              entity_name: name
            })
          })
        });
        console.log('✅ Product CREATE logged to activity logs');
      } catch (logError) {
        console.error('❌ Failed to log activity:', logError);
      }
      
      alert('Product created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setSelectedGroupId('');
      setStock('');
      setImageFile(null);
      setImagePreview('');
      setSelectedSupplier(null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Plus className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white">Add New Product</h3>
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
                value={name}
                onChange={e => setName(e.target.value)}
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
                value={description}
                onChange={e => setDescription(e.target.value)}
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
                  value={category}
                  onChange={e => setCategory(e.target.value)}
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
                  value={selectedGroupId}
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
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Initial Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm">
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Product Image
              </label>
              
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
                        Click to upload product image
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
                disabled={loading || loadingGroups}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    Create Product
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => alert('Cancel clicked')}
                disabled={loading}
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

export default NewProduct;