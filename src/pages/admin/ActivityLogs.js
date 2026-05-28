import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import { Search, RefreshCw, Activity, User, Clock, Shield } from 'lucide-react';
import useRealtimeRefresh from '../../realtime/useRealtimeRefresh';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    username: '',
    limit: 100
  });

    const token = (localStorage.getItem('token') || '').trim();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    console.log('📊 [ACTIVITY LOGS] Fetching logs from API...');
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.username) params.append('username', filters.username);
      params.append('limit', filters.limit);

      const url = `${API_URL}/activity-logs?${params}`;
      console.log('📊 [ACTIVITY LOGS] Request URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 [ACTIVITY LOGS] Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await response.json();
      console.log('📊 [ACTIVITY LOGS] Fetched logs count:', data.length);
      console.log('📊 [ACTIVITY LOGS] Logs data:', data);
      
      setLogs(data);
    } catch (err) {
      console.error('❌ [ACTIVITY LOGS] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useRealtimeRefresh(fetchLogs, payload => Boolean(payload?.type));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action) => {
    const badges = {
      'LOGIN': 'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'LOGOUT': 'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      'CREATE': 'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      'UPDATE': 'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      'DELETE': 'px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white'
    };
    return badges[action] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white';
  };

  const formatTargetData = (targetData) => {
    if (!targetData) return '-';
    
    let data = targetData;
    if (typeof targetData === 'string') {
      try {
        data = JSON.parse(targetData);
      } catch (e) {
        return targetData;
      }
    }
    
    if (typeof data === 'object') {
      const { entity, entity_name, entity_id } = data;
      if (!entity) return '-';
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{entity}</span>
          {entity_name && <span className="text-sm text-gray-600">"{entity_name}"</span>}
          {entity_id && <span className="text-xs text-gray-500">ID: {entity_id}</span>}
        </div>
      );
    }
    
    return String(targetData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
            Activity Logs
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Monitor and track all system activities</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Search className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Filter Logs</h2>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                name="action"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filters.action}
                onChange={handleFilterChange}
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Search username..."
                value={filters.username}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
              <input
                type="number"
                name="limit"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filters.limit}
                onChange={handleFilterChange}
                min="10"
                max="500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => {
                  setFilters({ action: '', username: '', limit: 100 });
                  fetchLogs();
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Id
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Role
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Action
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Target Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Date & Time
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No activity logs found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {log.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{log.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {log.role.split(',')[0].replace(/ROLE_/g, '')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getActionBadge(log.action)}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatTargetData(log.targetData)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {log.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logs.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{logs.length}</span> activity log{logs.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
