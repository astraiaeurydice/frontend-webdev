import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Home, User, Search, Heart, Plus, Send, X, MessageSquare, Clock, CheckCircle, XCircle, Package, ArrowRightLeft, LogOut } from 'lucide-react';
import CartSection from '../../components/customer/CartSection';
import OrderHistory from '../../components/customer/OrderHistory';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [myTradePosts, setMyTradePosts] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('ecommerce');
  const [tradingView, setTradingView] = useState('browse'); // browse, my-posts, requests-sent, requests-received
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [cart, setCart] = useState([]);

  
  const getProductImage = (product) => assetUrl(product?.image);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          image: getProductImage(product),
        },
      ];
    });
  };

  const buyNow = (product) => {
    addToCart(product);
    setCurrentPage('cart');
  };

  // Fetch products from backend
  useEffect(() => {
    if (currentPage === 'ecommerce') {
      fetchProducts();
    }
  }, [currentPage]);

  // Fetch trading data when trading page is active
  useEffect(() => {
    if (currentPage === 'trading') {
      fetchTradingData();
    }
  }, [currentPage, tradingView]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/products`, {
        headers
      });

      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Trim token to remove any whitespace
      const cleanToken = token.trim();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      };
      
      let res;
      let endpoint = '';
      
      if (tradingView === 'browse') {
        endpoint = `${API_URL}/trades`;
      } else if (tradingView === 'my-posts') {
        endpoint = `${API_URL}/trades/my-posts`;
      } else if (tradingView === 'requests-sent') {
        endpoint = `${API_URL}/trades/requests/sent`;
      } else if (tradingView === 'requests-received') {
        endpoint = `${API_URL}/trades/requests/received`;
      }

      if (!endpoint) {
        setLoading(false);
        return;
      }

      res = await fetch(endpoint, {
        method: 'GET',
        headers: headers
      });

      // Handle 401/403 errors
      if (res.status === 401 || res.status === 403) {
        console.error('Authentication failed. Status:', res.status);
        const errorData = await res.json().catch(() => ({ error: 'Unauthorized' }));
        console.error('Error response:', errorData);
        
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        
        // Reset all data
        setTrades([]);
        setMyTradePosts([]);
        setSentRequests([]);
        setReceivedRequests([]);
        setLoading(false);
        return;
      }

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${contentType} instead of JSON. Status: ${res.status}`);
      }

      const data = await res.json();

      if (res.ok) {
        // Update appropriate state based on view
        if (tradingView === 'browse') {
          setTrades(Array.isArray(data) ? data : []);
        } else if (tradingView === 'my-posts') {
          setMyTradePosts(Array.isArray(data) ? data : []);
        } else if (tradingView === 'requests-sent') {
          setSentRequests(Array.isArray(data) ? data : []);
        } else if (tradingView === 'requests-received') {
          setReceivedRequests(Array.isArray(data) ? data : []);
        }
      } else {
        console.error(`Failed to fetch ${tradingView}:`, data);
        // Reset appropriate state
        if (tradingView === 'browse') {
          setTrades([]);
        } else if (tradingView === 'my-posts') {
          setMyTradePosts([]);
        } else if (tradingView === 'requests-sent') {
          setSentRequests([]);
        } else if (tradingView === 'requests-received') {
          setReceivedRequests([]);
        }
      }
    } catch (err) {
      console.error('Error fetching trading data:', err);
      // Reset data on error
      setTrades([]);
      setMyTradePosts([]);
      setSentRequests([]);
      setReceivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrade = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You must be logged in to create a trade post');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemOffered: formData.get('itemOffered'),
          itemOfferedDescription: formData.get('itemOfferedDescription'),
          itemOfferedImage: formData.get('itemOfferedImage'),
          itemWanted: formData.get('itemWanted'),
          itemWantedDescription: formData.get('itemWantedDescription')
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchTradingData();
        alert('Trade post created successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create trade post');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create trade post');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You must be logged in to send a trade request');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/trades/${selectedTrade.id}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: formData.get('message')
        })
      });

      if (res.ok) {
        setShowRequestModal(false);
        setSelectedTrade(null);
        alert('Trade request sent successfully!');
        fetchTradingData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send trade request');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send trade request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setConfirmAction({
      type: 'accept',
      id: requestId,
      message: 'Accept this trade request? This will send it to admin for verification.'
    });
  };

  const handleRejectRequest = async (requestId) => {
    setConfirmAction({
      type: 'reject',
      id: requestId,
      message: 'Reject this trade request?'
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You must be logged in to perform this action');
      setConfirmAction(null);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (confirmAction.type === 'accept') {
        const res = await fetch(`${API_URL}/trades/requests/${confirmAction.id}/accept`, {
          method: 'POST',
          headers
        });

        if (res.ok) {
          alert('Trade request accepted! Waiting for admin verification.');
          fetchTradingData();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to accept request');
        }
      } else if (confirmAction.type === 'reject') {
        const res = await fetch(`${API_URL}/trades/requests/${confirmAction.id}/reject`, {
          method: 'POST',
          headers
        });

        if (res.ok) {
          alert('Trade request rejected.');
          fetchTradingData();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to reject request');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process request');
    } finally {
      setConfirmAction(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const tradingTabs = [
    { id: 'browse', label: 'Browse Trades', icon: Search },
    { id: 'my-posts', label: 'My Posts', icon: Package },
    { id: 'requests-sent', label: 'Sent Requests', icon: Send },
    { id: 'requests-received', label: 'Received Requests', icon: MessageSquare }
  ];

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && currentPage !== 'home') return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/assets/kmerch_logo.png" 
                  alt="KMerch Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                ShopTrade
              </h1>
            </div>
            
            {currentPage === 'ecommerce' && (
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Heart size={24} className="text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('cart')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <ShoppingCart size={24} className="text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((n, i) => n + i.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                title="Logout"
              >
                <LogOut size={20} className="text-gray-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                    isActive
                      ? 'text-cyan-600 border-b-2 border-cyan-600'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to ShopTrade
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Your one-stop destination for shopping and trading
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentPage('ecommerce')}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <ShoppingCart size={48} className="mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">E-Commerce</h3>
                <p>Browse and purchase products</p>
              </button>
              <button
                onClick={() => setCurrentPage('trading')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <TrendingUp size={48} className="mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Trading</h3>
                <p>Explore trading opportunities</p>
              </button>
            </div>
          </div>
        )}

        {currentPage === 'cart' && (
          <CartSection cart={cart} setCart={setCart} onBack={() => setCurrentPage('ecommerce')} />
        )}

        {currentPage === 'orders' && <OrderHistory />}

        {currentPage === 'ecommerce' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Our Products
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No products match your search.' : 'No products available.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 group flex flex-col"
                  >
                    <div className="relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={20} className="text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        ₱{product.price}
                      </p>
                      <div className="mt-auto space-y-2">
                        <button
                          type="button"
                          onClick={() => buyNow(product)}
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                          Buy Now
                        </button>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="w-full border-2 border-cyan-500 text-cyan-600 py-2 rounded-lg hover:bg-cyan-50 transition-all font-medium"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'trading' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Trading Platform
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <Plus size={20} />
                <span>Create Trade Post</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex space-x-1 p-2">
                {tradingTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tradingView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTradingView(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {tradingView === 'browse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trades.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <ArrowRightLeft size={64} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">No trades available at the moment</p>
                  </div>
                ) : (
                  trades.map((trade) => (
                    <div key={trade.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trade.status)}`}>
                            {trade.status}
                          </span>
                          <span className="text-sm text-gray-500">by @{trade.user.username}</span>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Offering:</h4>
                            <p className="text-lg font-bold text-gray-900 mb-1">{trade.itemOffered}</p>
                            {trade.itemOfferedDescription && (
                              <p className="text-sm text-gray-600">{trade.itemOfferedDescription}</p>
                            )}
                          </div>

                          <div className="flex justify-center">
                            <ArrowRightLeft className="text-purple-500" size={24} />
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Looking for:</h4>
                            <p className="text-lg font-bold text-gray-900 mb-1">{trade.itemWanted}</p>
                            {trade.itemWantedDescription && (
                              <p className="text-sm text-gray-600">{trade.itemWantedDescription}</p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedTrade(trade);
                            setShowRequestModal(true);
                          }}
                          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center space-x-2"
                        >
                          <Send size={18} />
                          <span>Want to Trade</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tradingView === 'my-posts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTradePosts.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <Package size={64} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg mb-4">You haven't created any trade posts yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      <Plus size={20} />
                      <span>Create Your First Trade</span>
                    </button>
                  </div>
                ) : (
                  myTradePosts.map((trade) => (
                    <div key={trade.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trade.status)}`}>
                            {trade.status}
                          </span>
                          <span className="text-sm text-gray-500">{new Date(trade.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Offering:</h4>
                            <p className="text-lg font-bold text-gray-900">{trade.itemOffered}</p>
                          </div>

                          <div className="flex justify-center">
                            <ArrowRightLeft className="text-purple-500" size={24} />
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Looking for:</h4>
                            <p className="text-lg font-bold text-gray-900">{trade.itemWanted}</p>
                          </div>
                        </div>

                        {trade.requestsCount > 0 && (
                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <p className="text-sm font-semibold text-blue-800">
                              {trade.requestsCount} {trade.requestsCount === 1 ? 'request' : 'requests'} received
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tradingView === 'requests-sent' && (
              <div className="space-y-4">
                {sentRequests.length === 0 ? (
                  <div className="text-center py-20">
                    <Send size={64} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">You haven't sent any trade requests yet</p>
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Trade with @{request.tradePost.user.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Sent on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">They're offering:</h4>
                          <p className="font-semibold">{request.tradePost.itemOffered}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">They want:</h4>
                          <p className="font-semibold">{request.tradePost.itemWanted}</p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">Your message:</h4>
                          <p className="text-sm">{request.message}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tradingView === 'requests-received' && (
              <div className="space-y-4">
                {receivedRequests.length === 0 ? (
                  <div className="text-center py-20">
                    <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">No trade requests received yet</p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Request from @{request.requester.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Received on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">You're offering:</h4>
                          <p className="font-semibold">{request.tradePost.itemOffered}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">You want:</h4>
                          <p className="font-semibold">{request.tradePost.itemWanted}</p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">Their message:</h4>
                          <p className="text-sm">{request.message}</p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all font-medium flex items-center justify-center space-x-2"
                          >
                            <CheckCircle size={18} />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all font-medium flex items-center justify-center space-x-2"
                          >
                            <XCircle size={18} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {currentPage === 'profile' && (
          <div className="text-center py-20">
            <User size={64} className="mx-auto mb-4 text-cyan-600" />
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              User Profile
            </h2>
            <p className="text-gray-600 text-lg">
              Profile features coming soon...
            </p>
          </div>
        )}
      </main>

      {/* Create Trade Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Create Trade Post
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTrade} className="space-y-6">
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">What are you offering?</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        name="itemOffered"
                        required
                        placeholder="e.g., BTS Merch"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="itemOfferedDescription"
                        rows="3"
                        placeholder="Describe your item..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL (optional)
                      </label>
                      <input
                        type="text"
                        name="itemOfferedImage"
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">What do you want?</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        name="itemWanted"
                        required
                        placeholder="e.g., Blackpink Merch"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="itemWantedDescription"
                        rows="3"
                        placeholder="Describe what you're looking for..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Create Trade Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Trade Request Modal */}
      {showRequestModal && selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Send Trade Request
                </h2>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedTrade(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 space-y-3">
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">They're offering:</p>
                  <p className="font-semibold text-lg">{selectedTrade.itemOffered}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">They want:</p>
                  <p className="font-semibold text-lg">{selectedTrade.itemWanted}</p>
                </div>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Tell them why you'd like to trade..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedTrade(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center space-x-2"
                  >
                    <Send size={18} />
                    <span>Send Request</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h3>
              <p className="text-gray-600 mb-6">{confirmAction.message}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className={`flex-1 px-6 py-3 rounded-lg transition-all font-medium text-white ${
                    confirmAction.type === 'accept' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
