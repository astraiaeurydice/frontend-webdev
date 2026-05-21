import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../config/api';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Menu, X, Building2, 
  Layers, Send, ShoppingBag, Activity, BarChart3, LogOut, UserCircle, CheckCircle2
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userRoles, setUserRoles] = useState([]);

  // Define all sidebar items with role access
  const allSidebarItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/admin/dashboard',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF'] 
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: Package, 
      path: '/admin/products',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    { 
      id: 'groups', 
      label: 'Groups', 
      icon: Layers, 
      path: '/admin/groups',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    { 
      id: 'suppliers', 
      label: 'Suppliers', 
      icon: Building2, 
      path: '/admin/suppliers',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    { 
      id: 'stockRequest', 
      label: 'Stock Request', 
      icon: Send, 
      path: '/admin/stock-request',
      allowedRoles: [ 'ROLE_STAFF']
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Package, 
      path: '/admin/inventory',
      allowedRoles: ['ROLE_ADMIN']
    },
    { 
      id: 'customOrder', 
      label: 'Custom Order', 
      icon: Building2, 
      path: '/admin/custom-order',
      allowedRoles: ['ROLE_ADMIN']
    },
    { 
      id: 'customTrade', 
      label: 'Trade Verification', 
      icon: CheckCircle2, 
      path: '/admin/trade-verification',
      allowedRoles: ['ROLE_ADMIN']
    },
    { 
      id: 'orders', 
      label: 'Purchase Records', 
      icon: ShoppingBag, 
      path: '/admin/orders',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    { 
      id: 'trading', 
      label: 'Trading History', 
      icon: Activity, 
      path: '/admin/trading',
      allowedRoles: ['ROLE_ADMIN']
    },
    { 
      id: 'userManagement', 
      label: 'User Management', 
      icon: BarChart3, 
      path: '/admin/userManagement',
      allowedRoles: ['ROLE_ADMIN']
    },
    { 
      id: 'activityLogs', 
      label: 'Activity Logs', 
      icon: BarChart3, 
      path: '/admin/ActivityLogs',
      allowedRoles: ['ROLE_ADMIN']
    },

    {
      id: 'StockRequestVerification',
      label: 'Stock Request Verification',
      icon: CheckCircle2,
      path: '/admin/stock-request-verification',
      allowedRoles: ['ROLE_ADMIN']
    }
  ];

  // Filter sidebar items based on user roles
  const sidebarItems = allSidebarItems.filter(item => 
    item.allowedRoles.some(role => userRoles.includes(role))
  );

  // Fetch user data and roles on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const storedRoles = localStorage.getItem('roles');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Set roles from localStorage
      if (storedRoles) {
        try {
          const roles = JSON.parse(storedRoles);
          setUserRoles(Array.isArray(roles) ? roles : [roles]);
        } catch (e) {
          setUserRoles([storedRoles]);
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(token || '').trim()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            navigate('/login', { replace: true });
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
        
        // Update roles if they come from the API
        if (data.roles) {
          setUserRoles(Array.isArray(data.roles) ? data.roles : [data.roles]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;
    const found = sidebarItems.find(item => item.path === path);
    if (found) setActivePage(found.id);
  }, [location, sidebarItems]);

  const handleNavigation = (item) => {
    setActivePage(item.id);
    navigate(item.path);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call backend logout endpoint to log the activity
      if (token) {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(token || '').trim()}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear localStorage and navigate
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      navigate('/login');
    }
  };

  const getInitials = () => {
    if (!userData) return 'A';
    const first = userData.firstName?.[0] || '';
    const last = userData.lastName?.[0] || '';
    return (first + last).toUpperCase() || userData.username?.[0]?.toUpperCase() || 'A';
  };

  const getDisplayName = () => {
    if (!userData) return 'Admin User';
    return userData.fullName || `${userData.firstName} ${userData.lastName}` || userData.username || 'Admin User';
  };

  const getRoleLabel = () => {
    if (userRoles.includes('ROLE_ADMIN')) return 'Administrator';
    if (userRoles.includes('ROLE_STAFF')) return 'Staff Member';
    return 'User';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white shadow-2xl transition-all duration-300 flex flex-col border-r border-gray-200`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  K-Dream Admin
                </h1>
                <p className="text-xs text-gray-500 mt-1">{getRoleLabel()}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile + Logout */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 relative">
            {isLoadingUser ? (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-3 w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userData?.email || 'admin@kpop.com'}
                    </p>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute bottom-20 left-4 right-4 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Account</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500">{userData?.email}</p>
                      {userData?.phoneNumber && (
                        <p className="text-xs text-gray-500 mt-1">{userData.phoneNumber}</p>
                      )}
                      <p className="text-xs text-purple-600 mt-2 font-medium">{getRoleLabel()}</p>
                    </div>
                    <button
                      onClick={() => navigate('/admin/profile')}
                      className="flex items-center gap-2 w-full px-4 py-3 text-purple-600 hover:bg-purple-50 transition border-b border-gray-100"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">View Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Log Out</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Collapsed Profile */}
        {!sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isLoadingUser ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {getInitials()}
                </div>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;