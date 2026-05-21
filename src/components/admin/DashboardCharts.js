import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, RefreshCw } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const ANALYTICS_API = `${API_BASE_URL}/api/admin/analytics`;

/** Sales charts shown at the top of the admin dashboard. */
const DashboardCharts = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${ANALYTICS_API}?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAnalytics(await response.json());
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  const lineChartOptions = {
    ...chartOptions,
    elements: { line: { tension: 0.4, fill: true } },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center text-gray-500">
        Loading sales charts...
      </div>
    );
  }

  if (!analytics?.orders) {
    return null;
  }

  const revenueOverTimeData = {
    labels: Object.keys(analytics.orders.revenueOverTime || {}),
    datasets: [{
      label: 'Revenue (₱)',
      data: Object.values(analytics.orders.revenueOverTime || {}),
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
    }],
  };

  const topProducts = analytics.orders.topProducts || {};
  const topProductsData = {
    labels: Object.keys(topProducts).slice(0, 5),
    datasets: [{
      label: 'Revenue (₱)',
      data: Object.values(topProducts).slice(0, 5).map((p) => p.revenue),
      backgroundColor: 'rgba(236, 72, 153, 0.8)',
      borderColor: 'rgb(236, 72, 153)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Sales Overview
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button type="button" onClick={fetchAnalytics} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold text-green-700">₱{(analytics.orders.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold">Completed Orders</p>
          <p className="text-2xl font-bold text-purple-700">{analytics.orders.completed ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold">Products</p>
          <p className="text-2xl font-bold text-blue-700">{analytics.products?.total ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Revenue Over Time</h4>
          <div className="h-64">
            <Line data={revenueOverTimeData} options={lineChartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Top Products by Revenue</h4>
          <div className="h-64">
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
