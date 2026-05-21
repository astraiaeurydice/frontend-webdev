import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import React, { useState } from 'react';
import { ShoppingCart, Trash2, Receipt } from 'lucide-react';



/**
 * Shopping cart + checkout (no payment gateway — generates a receipt, updates stock & sales).
 */
export default function CartSection({ cart, setCart, onBack }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to checkout.');
      return;
    }
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      setReceipt(data.receipt || data);
      setCart([]);
    } catch (err) {
      alert(err.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Order Receipt</h2>
        </div>
        <p className="text-sm text-gray-500 mb-1">Receipt #</p>
        <p className="font-mono font-bold text-purple-700 mb-4">{receipt.receiptNumber}</p>
        <p className="text-sm text-gray-600 mb-4">
          {receipt.customerName} · {new Date(receipt.createdAt).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mb-4">{receipt.paymentMethod}</p>
        <ul className="divide-y border-t border-b mb-4">
          {(receipt.items || []).map((item) => (
            <li key={item.orderId} className="py-3 flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold">₱{Number(item.totalPrice).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-xl font-bold text-right text-gray-900 mb-6">
          Total: ₱{Number(receipt.total).toFixed(2)}
        </p>
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-4">
          Sale recorded. Stock updated. View in Admin → Purchase Records / Dashboard charts.
        </p>
        <button
          type="button"
          onClick={() => {
            setReceipt(null);
            onBack?.();
          }}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <ShoppingCart /> Cart ({cart.length})
        </h2>
        {onBack && (
          <button type="button" onClick={onBack} className="text-cyan-600 font-medium hover:underline">
            ← Back to shop
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-center py-16">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cart.map((item) => (
              <li key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
                {item.image && (
                  <img src={item.image} alt="" className="w-20 h-20 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-purple-600 font-bold">₱{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" onClick={() => updateQty(item.id, -1)} className="px-2 py-1 border rounded">
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, 1)} className="px-2 py-1 border rounded">
                      +
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="flex justify-between text-lg font-bold mb-4">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </p>
            <button
              type="button"
              disabled={checkoutLoading}
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {checkoutLoading ? 'Processing...' : 'Complete Purchase (Generate Receipt)'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

