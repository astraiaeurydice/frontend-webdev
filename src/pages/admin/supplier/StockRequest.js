import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../../../config/api';
import React, { useState, useEffect } from "react";
import { Send, Package, DollarSign, FileText, AlertCircle, CheckCircle, Building2, Users, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const StockRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [autoSelectedSupplier, setAutoSelectedSupplier] = useState(null);
  const [manualSupplierOverride, setManualSupplierOverride] = useState("");
  const [showManualSupplier, setShowManualSupplier] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const productsRes = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!productsRes.ok) throw new Error(`Products API error: ${productsRes.status}`);

      const productData = await productsRes.json();
      setProducts(Array.isArray(productData) ? productData : []);

      const supplierRes = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (supplierRes.ok) {
        const supplierData = await supplierRes.json();
        setSuppliers(Array.isArray(supplierData) ? supplierData : []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert("error", `Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refetch when navigating back to this page
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [location.pathname]);

  // ✅ Refetch when window/tab gains focus
  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // ✅ Refetch when a group’s supplier is updated (from GroupsManagement)
  useEffect(() => {
    const handleGroupUpdate = () => {
      console.log("Detected group update — refetching StockRequest data...");
      fetchData();
    };

    window.addEventListener("groupUpdated", handleGroupUpdate);
    return () => window.removeEventListener("groupUpdated", handleGroupUpdate);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);

    const product = products.find((p) => p.id === parseInt(productId));
    setSelectedProductDetails(product);

    if (product) {
      if (product.supplier) {
        setAutoSelectedSupplier(product.supplier);
      } else if (product.group && product.group.supplier) {
        setAutoSelectedSupplier(product.group.supplier);
      } else {
        setAutoSelectedSupplier(null);
        setShowManualSupplier(true);
      }
    } else {
      setAutoSelectedSupplier(null);
    }

    setManualSupplierOverride("");
  };

  const calculateTotal = () => {
    if (quantity && unitPrice) {
      return (parseFloat(unitPrice) * parseInt(quantity, 10)).toFixed(2);
    }
    return "0.00";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem("token");
    const body = {
      product_id: parseInt(selectedProduct, 10),
      quantity: parseInt(quantity, 10),
    };

    if (manualSupplierOverride) body.supplier_id = parseInt(manualSupplierOverride, 10);
    if (unitPrice && unitPrice.trim() !== "") body.unit_price = parseFloat(unitPrice).toFixed(2);
    if (notes.trim()) body.notes = notes.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send stock request");

      showAlert("success", `Stock request sent successfully! Request ID: #${data.id}`);

      // Reset form
      setSelectedProduct("");
      setSelectedProductDetails(null);
      setAutoSelectedSupplier(null);
      setManualSupplierOverride("");
      setShowManualSupplier(false);
      setQuantity("");
      setUnitPrice("");
      setNotes("");
    } catch (error) {
      console.error("Error sending stock request:", error);
      showAlert("error", error.message || "Error sending stock request");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ (everything else below remains unchanged)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-2 border-purple-300 border-t-purple-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Stock Request
            </h2>
            <p className="text-gray-500 font-medium text-sm">Request inventory from suppliers</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Alert */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              alert.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white">New Stock Request</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProduct}
                onChange={handleProductChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-white"
                required
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.stockQuantity !== undefined && `(Current Stock: ${p.stockQuantity})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Details Card */}
            {selectedProductDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Package className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Product Details
                    </span>
                    <h4 className="text-base font-bold text-gray-900 mt-1 mb-2">
                      {selectedProductDetails.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedProductDetails.group && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                          <span className="text-gray-700">
                            <strong>Group:</strong> {selectedProductDetails.group.name}
                          </span>
                        </div>
                      )}
                      {selectedProductDetails.category && (
                        <div className="text-gray-700">
                          <strong>Category:</strong> {selectedProductDetails.category}
                        </div>
                      )}
                      <div className="text-gray-700">
                        <strong>Current Stock:</strong> {selectedProductDetails.stockQuantity || 0}
                      </div>
                      <div className="text-gray-700">
                        <strong>Price:</strong> ₱{selectedProductDetails.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Selected Supplier Display */}
            {autoSelectedSupplier && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Building2 className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                        Supplier
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                        Auto-Selected
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {autoSelectedSupplier.companyName || autoSelectedSupplier.name}
                    </h4>
                    <div className="space-y-1">
                      {autoSelectedSupplier.email && (
                        <p className="text-sm text-gray-600">📧 {autoSelectedSupplier.email}</p>
                      )}
                      {autoSelectedSupplier.contactPerson && (
                        <p className="text-sm text-gray-600">👤 {autoSelectedSupplier.contactPerson}</p>
                      )}
                      {autoSelectedSupplier.phone && (
                        <p className="text-sm text-gray-600">📱 {autoSelectedSupplier.phone}</p>
                      )}
                    </div>
                    
                    {/* Option to override supplier */}
                    {suppliers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowManualSupplier(!showManualSupplier)}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-semibold underline"
                      >
                        {showManualSupplier ? 'Hide manual selection' : 'Change supplier manually'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Supplier Override */}
            {(showManualSupplier || (!autoSelectedSupplier && selectedProduct)) && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  {autoSelectedSupplier ? 'Override Supplier (Optional)' : 'Select Supplier'} 
                  {!autoSelectedSupplier && <span className="text-red-500"> *</span>}
                </label>
                <select
                  value={manualSupplierOverride}
                  onChange={(e) => setManualSupplierOverride(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-white"
                  required={!autoSelectedSupplier}
                >
                  <option value="">
                    {autoSelectedSupplier ? 'Keep auto-selected supplier' : 'Select a supplier'}
                  </option>
                  {suppliers.length === 0 ? (
                    <option disabled>No suppliers available</option>
                  ) : (
                    suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.companyName || s.company_name || s.email || `Supplier #${s.id}`}
                      </option>
                    ))
                  )}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-sm text-red-500 mt-2 font-medium">
                    No suppliers found. Please add suppliers first.
                  </p>
                )}
              </div>
            )}

            {/* No Supplier Warning */}
            {!autoSelectedSupplier && selectedProduct && !showManualSupplier && (
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold text-pink-800">
                    No supplier assigned to this product or its group.
                  </p>
                  <p className="text-sm text-pink-700 mt-1">
                    Please select a supplier manually to continue.
                  </p>
                </div>
              </div>
            )}

            {/* Quantity and Unit Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Unit Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Total Price Display */}
            {quantity && unitPrice && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold text-sm">Estimated Total:</span>
                  <span className="text-2xl font-bold text-purple-700">
                    ₱{calculateTotal()}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                  <span>Notes (Optional)</span>
                </div>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm resize-none"
                placeholder="Add any additional information or special requests..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || (!autoSelectedSupplier && !manualSupplierOverride)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-md transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  <span>Send Stock Request</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockRequest;