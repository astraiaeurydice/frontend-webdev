import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../../config/api';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, X, Building2 } from 'lucide-react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';



const SUPPLIERS_API = `${API_URL}/suppliers`;

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const isInitializingRef = useRef(false);

  // Helper function to log activity
  const logActivity = async (action, supplierData) => {
    try {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      if (!userData) {
        console.warn('📝 [ACTIVITY LOG] No user data, cannot log activity');
        return;
      }

      const targetData = {
        entity: 'Supplier',
        entity_id: supplierData.id || supplierData.entity_id,
        entity_name: supplierData.companyName || supplierData.entity_name,
        email: supplierData.email,
        status: supplierData.status
      };

      const activityData = {
        userId: userData.id,
        username: userData.username,
        role: userData.role,
        action: action,
        targetData: JSON.stringify(targetData)
      };

      console.log('📝 [ACTIVITY LOG] Sending activity log:', activityData);

      const response = await fetch(`${API_BASE_URL}/api/activity-logs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });

      if (response.ok) {
        console.log('✅ [ACTIVITY LOG] Activity logged successfully');
      } else {
        console.error('❌ [ACTIVITY LOG] Failed to log activity:', await response.text());
      }
    } catch (error) {
      console.error('❌ [ACTIVITY LOG] Error logging activity:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useLayoutEffect(() => {
    if (!loading && suppliers.length > 0 && tableRef.current && !isInitializingRef.current) {
      isInitializingRef.current = true;

      // Destroy existing DataTable instance if it exists
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable:', err);
        }
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          // Initialize DataTable
          dataTableRef.current = $(tableRef.current).DataTable({
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            order: [[0, 'asc']],
            columnDefs: [
              { orderable: false, targets: 6 } // Disable sorting on Actions column
            ],
            language: {
              search: "_INPUT_",
              searchPlaceholder: "Search suppliers...",
              lengthMenu: "Show _MENU_ entries",
              info: "Showing _START_ to _END_ of _TOTAL_ suppliers",
              infoEmpty: "Showing 0 to 0 of 0 suppliers",
              infoFiltered: "(filtered from _MAX_ total suppliers)",
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
            },
            destroy: true // Allow reinitialization
          });

          // Add custom styling only once
          if (!document.getElementById('datatable-custom-styles')) {
            const style = document.createElement('style');
            style.id = 'datatable-custom-styles';
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
                background: linear-gradient(to right, #9333ea, #ec4899);
                color: white;
                border-color: transparent;
              }
              .dataTables_paginate .paginate_button.current {
                background: linear-gradient(to right, #9333ea, #ec4899);
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
                background-color: #f9fafb !important;
              }
            `;
            document.head.appendChild(style);
          }
        } catch (err) {
          console.error('Error initializing DataTable:', err);
        } finally {
          isInitializingRef.current = false;
        }
      }, 100);
    }

    return () => {
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error in cleanup:', err);
        }
      }
      isInitializingRef.current = false;
    };
  }, [loading, suppliers]);

  const fetchSuppliers = async () => {
    try {
      console.log('🔵 [SUPPLIER] Fetching suppliers...');
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(SUPPLIERS_API, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('🔵 [SUPPLIER] Fetch response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch suppliers: ${res.status} ${text.substring(0, 100)}`);
      }
      const data = await res.json();
      console.log('🔵 [SUPPLIER] Fetched suppliers:', data.length);
      setSuppliers(data);
      setError(null);
    } catch (err) {
      console.error('❌ [SUPPLIER] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleView = async (id) => {
    try {
      console.log('👁️ [SUPPLIER] Viewing supplier:', id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${SUPPLIERS_API}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch supplier');
      const data = await res.json();
      console.log('👁️ [SUPPLIER] Supplier data:', data);
      setSelectedSupplier(data);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      console.error('❌ [SUPPLIER] View error:', err);
      setError(err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      console.log('✏️ [SUPPLIER] Editing supplier:', id);
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      console.log('✏️ [SUPPLIER] Current User:', userData);
      console.log('✏️ [SUPPLIER] User Role:', userData?.role || 'Unknown');
      
      const res = await fetch(`${SUPPLIERS_API}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch supplier');
      const data = await res.json();
      console.log('✏️ [SUPPLIER] Loaded data for edit:', data);
      setFormData({
        companyName: data.companyName || '',
        contactPerson: data.contactPerson || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        status: data.status || 'active'
      });
      setSelectedSupplier(data);
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      console.error('❌ [SUPPLIER] Edit error:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      console.log('🗑️ [SUPPLIER] Deleting supplier:', id);
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      console.log('🗑️ [SUPPLIER] Token:', token ? 'Present' : 'Missing');
      console.log('🗑️ [SUPPLIER] Current User:', userData);
      console.log('🗑️ [SUPPLIER] User Role:', userData?.role || 'Unknown');
      console.log('🗑️ [SUPPLIER] User ID:', userData?.id || 'Unknown');
      console.log('🗑️ [SUPPLIER] Username:', userData?.username || 'Unknown');
      
      const res = await fetch(`${SUPPLIERS_API}/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🗑️ [SUPPLIER] Delete response status:', res.status);
      const responseData = await res.json();
      console.log('🗑️ [SUPPLIER] Delete response:', responseData);
      
      if (!res.ok) throw new Error('Failed to delete supplier');
      
      console.log('✅ [SUPPLIER] Supplier deleted successfully');

      // Log activity for deleted supplier
      const deletedSupplier = suppliers.find(s => s.id === id);
      if (deletedSupplier) {
        await logActivity('DELETE', {
          id: deletedSupplier.id,
          companyName: deletedSupplier.companyName,
          email: deletedSupplier.email,
          status: deletedSupplier.status
        });
      }
      
      // Destroy DataTable before React updates rows to avoid DOM conflicts
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable before delete refresh:', err);
        }
      }
      await fetchSuppliers();
      setError(null);
    } catch (err) {
      console.error('❌ [SUPPLIER] Delete error:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log(`➕ [SUPPLIER] ${modalMode === 'add' ? 'Creating' : 'Updating'} supplier...`);
      console.log(`➕ [SUPPLIER] Form data:`, formData);
      
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      console.log('➕ [SUPPLIER] Token:', token ? 'Present' : 'Missing');
      console.log('➕ [SUPPLIER] Current User:', userData);
      console.log('➕ [SUPPLIER] User Role:', userData?.role || 'Unknown');
      console.log('➕ [SUPPLIER] User ID:', userData?.id || 'Unknown');
      console.log('➕ [SUPPLIER] Username:', userData?.username || 'Unknown');
      
      const url = modalMode === 'add' ? SUPPLIERS_API : `${SUPPLIERS_API}/${selectedSupplier.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      console.log(`➕ [SUPPLIER] Sending ${method} to ${url}`);
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log(`➕ [SUPPLIER] Response status:`, res.status);
      const responseData = await res.json();
      console.log(`➕ [SUPPLIER] Response data:`, responseData);
      
      if (!res.ok) throw new Error(`Failed to ${modalMode} supplier`);
      
      console.log(`✅ [SUPPLIER] Supplier ${modalMode === 'add' ? 'created' : 'updated'} successfully`);

      // Log activity
      const supplierData = {
        id: modalMode === 'add' ? responseData.id : selectedSupplier.id,
        companyName: formData.companyName,
        email: formData.email,
        status: formData.status
      };
      await logActivity(modalMode === 'add' ? 'CREATE' : 'UPDATE', supplierData);
      
      // Destroy DataTable before React updates rows to avoid DOM conflicts
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable before submit refresh:', err);
        }
      }
      await fetchSuppliers();
      setShowModal(false);
      setError(null);
    } catch (err) {
      console.error(`❌ [SUPPLIER] Submit error:`, err);
      setError(err.message);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Supplier Management
            </h2>
            <p className="text-gray-500 font-medium text-sm">Manage entertainment companies and suppliers</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Supplier
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1600px] mx-auto">
        {error && (
          <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded-xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        {/* Suppliers Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Building2 className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white">All Suppliers</h3>
              </div>
              <span className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-sm font-bold text-white">
                {suppliers.length} suppliers
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-2 border-purple-300 border-t-purple-600 mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Loading suppliers...</p>
              </div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-gray-400 font-medium">No suppliers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table ref={tableRef} className="w-full" key={suppliers.map(s => s.id).join(',')}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact Person</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliers.map(supplier => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs font-bold text-purple-600">#{supplier.id}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-gray-900 text-sm">{supplier.companyName}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 font-medium">{supplier.contactPerson || '-'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 font-medium">{supplier.email || '-'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 font-medium">{supplier.phone || '-'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                          supplier.status === 'active' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {supplier.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleView(supplier.id)}
                            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleEdit(supplier.id)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            className="p-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:shadow-md transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'view' ? 'View Supplier' : modalMode === 'edit' ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                  <p className="text-gray-900 font-medium">{selectedSupplier?.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person</label>
                  <p className="text-gray-900 font-medium">{selectedSupplier?.contactPerson || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{selectedSupplier?.email || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900 font-medium">{selectedSupplier?.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900 font-medium">{selectedSupplier?.address || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                    selectedSupplier?.status === 'active' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {selectedSupplier?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@company.com"
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm ${
                      formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                        ? 'border-pink-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <p className="text-pink-600 text-xs mt-1 font-medium">Please enter a valid email address.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-pink-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-l-xl text-gray-700 select-none font-medium text-sm">
                      +82
                    </span>
                    <input
                      type="tel"
                      value={formData.phone.replace(/^\+82/, '')}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 10) value = value.slice(0, 10);
                        handleInputChange('phone', `+82${value}`);
                      }}
                      placeholder="Enter phone number"
                      className={`flex-1 px-3 py-2.5 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm ${
                        formData.phone && !/^\+82\d{8,10}$/.test(formData.phone)
                          ? 'border-pink-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formData.phone && !/^\+82\d{8,10}$/.test(formData.phone) && (
                    <p className="text-pink-600 text-xs mt-1 font-medium">
                      Must contain 8–10 digits after +82.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all font-medium text-sm"
                  >
                    {modalMode === 'add' ? 'Add Supplier' : 'Update Supplier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}