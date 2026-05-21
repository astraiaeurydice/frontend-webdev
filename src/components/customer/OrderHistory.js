import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useEffect, useState } from 'react';
import { Receipt, RefreshCw } from 'lucide-react';



export default function OrderHistory() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view orders.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setReceipts(data.receipts || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 py-12">Loading order history...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button type="button" onClick={loadOrders} className="text-cyan-600 font-medium">
          Retry
        </button>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <p className="text-center text-gray-600 py-16">
        No purchases yet. Complete checkout from the shop to see receipts here.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <Receipt className="w-7 h-7 text-purple-600" /> My orders
        </h2>
        <button
          type="button"
          onClick={loadOrders}
          className="flex items-center gap-2 text-sm text-cyan-600 font-medium hover:underline"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-6">
        {receipts.map((receipt) => (
          <div
            key={receipt.receiptNumber}
            className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white">
              <p className="text-sm opacity-90">Receipt</p>
              <p className="font-mono font-bold">{receipt.receiptNumber}</p>
              <p className="text-xs mt-1 opacity-90">
                {new Date(receipt.createdAt).toLocaleString()}
              </p>
            </div>
            <ul className="divide-y px-6">
              {(receipt.items || []).map((item) => (
                <li key={item.orderId} className="py-3 flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₱{Number(item.totalPrice).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="px-6 py-4 text-right font-bold text-lg text-gray-900 border-t">
              Total: ₱{Number(receipt.total).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
