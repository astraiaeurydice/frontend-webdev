import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import { Edit, Trash2, Plus, Users, X, CheckCircle, XCircle, Archive, Mail } from 'lucide-react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const isInitializingRef = useRef(false);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    roles: [],
    markVerified: false,
    isVerified: true
  });

  
  const getToken = () => (localStorage.getItem('token') || '').trim();

  const availableRoles = [
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_STAFF', label: 'Staff' },
    { value: 'ROLE_MEDIATOR', label: 'Mediator' },
    { value: 'ROLE_SUPPLIER', label: 'Supplier' },
    { value: 'ROLE_USER', label: 'User (Customer)' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useLayoutEffect(() => {
    if (!loading && users.length > 0 && tableRef.current && !isInitializingRef.current) {
      isInitializingRef.current = true;

      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable:', err);
        }
      }

      setTimeout(() => {
        try {
          dataTableRef.current = $(tableRef.current).DataTable({
            pageLength: 10,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            order: [[0, 'asc']],
            columnDefs: [
              { orderable: false, targets: [5, 8] }
            ],
            language: {
              search: "_INPUT_",
              searchPlaceholder: "Search users...",
              lengthMenu: "Show _MENU_ entries",
              info: "Showing _START_ to _END_ of _TOTAL_ users",
              infoEmpty: "Showing 0 to 0 of 0 users",
              infoFiltered: "(filtered from _MAX_ total users)",
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
            destroy: true
          });

          if (!document.getElementById('datatable-custom-styles-users')) {
            const style = document.createElement('style');
            style.id = 'datatable-custom-styles-users';
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
  }, [loading, users]);

  // Fetch users from backend API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error fetching users from server');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      roles: selectedOptions
    }));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      phoneNumber: '+63',
      password: '',
      roles: [],
      markVerified: false,
      isVerified: true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      password: '',
      roles: (user.roles || []).filter(role => role !== 'ROLE_USER'),
      markVerified: false,
      isVerified: Boolean(user.isVerified)
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  // Submit form (create or update user)
  const handleSubmit = async () => {
    try {
      // Validate required fields for creation
      if (!editingUser) {
        if (!formData.email || !formData.username || !formData.firstName || 
            !formData.lastName || !formData.phoneNumber || !formData.password) {
          setError('Please fill in all required fields');
          return;
        }
      } else {
        // For editing, password is optional
        if (!formData.email || !formData.username || !formData.phoneNumber) {
          setError('Please fill in all required fields');
          return;
        }
      }

      const token = getToken();
      const url = editingUser 
        ? `${API_URL}/admin/users/${editingUser.id}`
        : `${API_URL}/admin/users`;
      
      const method = editingUser ? 'PUT' : 'POST';

      // Prepare payload
      const payload = {
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roles: formData.roles.length > 0 ? formData.roles : []
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (!editingUser) {
        payload.markVerified = Boolean(formData.markVerified);
      } else {
        payload.isVerified = Boolean(formData.isVerified);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to save user');
      }

      const result = await response.json();
      let msg = result.message || (editingUser ? 'User updated successfully!' : 'User created successfully!');
      if (result.verificationEmailSent === false && !editingUser && !formData.markVerified) {
        msg += ' Verification email was not sent — check mailer or use Resend verification.';
      }
      setSuccess(msg);
      setShowModal(false);
      
      // Destroy DataTable before React updates rows
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable before submit refresh:', err);
        }
      }
      
      await fetchUsers();
      setError('');
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Error performing operation');
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const statusCycle = {
        'active': 'disabled',
        'disabled': 'archived',
        'archived': 'active'
      };

      const newStatus = statusCycle[currentStatus] || 'active';
      const token = getToken();

      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }

      setSuccess(`User status updated to ${newStatus}`);
      
      // Destroy DataTable before React updates
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable:', err);
        }
      }
      
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message);
    }
  };

  const handleResendVerification = async (userId) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Not logged in');
        return;
      }
      const response = await fetch(`${API_URL}/admin/users/${userId}/resend-verification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }
      setSuccess(data.message || 'Verification email sent.');
      setError('');
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (e) { /* ignore */ }
      }
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Resend failed');
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = getToken();
      
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to delete user');
      }

      const result = await response.json();
      setSuccess(result.message || 'User deleted successfully!');
      
      // Destroy DataTable before React updates rows
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          dataTableRef.current = null;
        } catch (err) {
          console.error('Error destroying DataTable before delete refresh:', err);
        }
      }
      
      await fetchUsers();
      setError('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Error deleting user');
    }
  };

  const getRoleBadges = (roles) => {
    return roles.map(role => {
      const found = availableRoles.find(r => r.value === role);
      const label = found ? found.label : role;
      return (
        <span 
          key={role}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300 mr-1 mb-1"
        >
          {label}
        </span>
      );
    });
  };

  const getVerifiedBadge = (isVerified) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border-amber-300">
        <Mail className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': {
        icon: CheckCircle,
        className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300',
        label: 'Active'
      },
      'disabled': {
        icon: XCircle,
        className: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-300',
        label: 'Disabled'
      },
      'archived': {
        icon: Archive,
        className: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300',
        label: 'Archived'
      }
    };

    const config = statusConfig[status] || statusConfig['active'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              User Management
            </h2>
            <p className="text-gray-500 font-medium text-sm">Manage system users and permissions</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add New User
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Alerts */}
        {error && (
          <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded-xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 font-medium text-sm">
            {success}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white">All Users</h3>
              </div>
              <span className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-sm font-bold text-white">
                {users.length} users
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-2 border-purple-300 border-t-purple-600 mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-gray-400 font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table ref={tableRef} className="w-full" key={users.map(u => u.id).join(',')}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs font-bold text-purple-600">#{user.id}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-gray-900 text-sm">{user.username}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 font-medium">{user.email}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 font-medium">{user.firstName} {user.lastName}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 font-medium">{user.phoneNumber}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {getRoleBadges(user.roles)}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {getVerifiedBadge(Boolean(user.isVerified))}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          className="hover:scale-105 transition-transform"
                          title={`Click to toggle status (Current: ${user.status})`}
                        >
                          {getStatusBadge(user.status)}
                        </button>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {!user.isVerified && (
                            <button
                              type="button"
                              onClick={() => handleResendVerification(user.id)}
                              className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-md transition-all"
                              title="Resend verification email"
                            >
                              <Mail className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
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
                  Username <span className="text-pink-500">*</span>
                </label>
                <input 
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-pink-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-l-xl text-gray-700 select-none font-medium text-sm">
                    +63
                  </span>
                  <input
                    type="tel"
                    value={formData.phoneNumber.replace(/^\+63/, '')}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 10) value = value.slice(0, 10);
                      handleInputChange('phoneNumber', `+63${value}`);
                    }}
                    placeholder="Enter phone number"
                    className={`flex-1 px-3 py-2.5 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm ${
                      formData.phoneNumber && !/^\+63\d{10}$/.test(formData.phoneNumber)
                        ? 'border-pink-500'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                {formData.phoneNumber && !/^\+63\d{10}$/.test(formData.phoneNumber) && (
                  <p className="text-pink-600 text-xs mt-1 font-medium">
                    Must contain exactly 10 digits after +63.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password {editingUser && <span className="text-purple-600">(leave blank to keep current)</span>}
                  {!editingUser && <span className="text-pink-500">*</span>}
                </label>
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                />
              </div>

              {!editingUser && (
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                  <input
                    type="checkbox"
                    checked={formData.markVerified}
                    onChange={(e) => handleInputChange('markVerified', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Mark email as verified immediately</span>
                    <span className="block text-gray-500 mt-1">
                      If unchecked, the user receives the same verification email as self-registration and must verify before login.
                    </span>
                  </span>
                </label>
              )}

              {editingUser && (
                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Email verified</span>
                      <span className="block text-gray-500 mt-1">
                        Uncheck to require verification again (token is stored server-side only). Changing email in this form will always require re-verification.
                      </span>
                    </span>
                  </label>
                  {!formData.isVerified && (
                    <button
                      type="button"
                      onClick={() => handleResendVerification(editingUser.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Resend verification email
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Roles <span className="text-purple-600">(hold Ctrl/Cmd to select multiple)</span>
                </label>
                <select 
                  multiple
                  value={formData.roles}
                  onChange={handleRoleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-white"
                  style={{ height: '150px' }}
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value} className="py-2">
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-200">
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
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}