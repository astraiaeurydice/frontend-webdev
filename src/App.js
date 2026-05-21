import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckEmail from "./pages/CheckEmail";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import OAuthCallback from "./pages/OAuthCallback";


// Dashboards
import CustomerDashboard from "./pages/customer/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import MediatorDashboard from "./pages/mediator/Dashboard";
import SupplierDashboard from "./pages/admin/StockRequestVerification";

// Admin Layout (wraps admin pages with sidebar)
import AdminLayout from "./components/AdminLayout";

// Admin Pages
import Inventory from "./pages/admin/Inventory";
import GroupsManagement from './pages/admin/GroupsManagement';
import SupplierManagement from './pages/admin/supplier/SupplierManagement';
import StockRequest from './pages/admin/supplier/StockRequest';
import CustomOrder from "./pages/admin/customOrder";
import TradeVerification from "./pages/admin/TradeVerification";
import PurchaseRecords from "./pages/admin/PurchaseRecords";
import TradingHistory from "./pages/admin/TradingHistory";
import UserManagement from "./pages/admin/UserManagement";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Profile from "./pages/admin/Profile";
import StockRequestVerification from "./pages/admin/StockRequestVerification";


// Admin Product CRUD
import ProductManagement from "./pages/admin/products/ProductManagement";
import NewProduct from "./pages/admin/products/NewProduct";
import EditProduct from "./pages/admin/products/EditProduct";
import ViewProduct from "./pages/admin/products/ViewProduct";

import Navbar from "./components/Navbar";

function AppContent() {
  const location = useLocation();

  // Navbar visible only on these public routes
  const navbarRoutes = ["/", "/about", "/contact", "/login", "/register", "/check-email"];
  const showNavbar = navbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <>
          <Navbar />
          <div className="pt-16" /> {/* Padding so content doesn't hide under navbar */}
        </>
      )}

      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-email" element={<CheckEmail />} />
        </Route>
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Dashboard routes (without AdminLayout - direct access) */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_USER"]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ROLE_MEDIATOR"]} />}>
          <Route path="/mediator/dashboard" element={<MediatorDashboard />} />
        </Route>        
        
        <Route element={<ProtectedRoute allowedRoles={["ROLE_SUPPLIER", "ROLE_ADMIN"]} />}>
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
        </Route>
        {/* Admin routes with shared sidebar layout — ADMIN and STAFF */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/new" element={<NewProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="products/view/:id" element={<ViewProduct />} />
            <Route path="groups" element={<GroupsManagement />} />
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="profile" element={<Profile />} />
            {/* Admin-only routes */}
            <Route path="inventory" element={<Inventory />} />
            <Route path="custom-order" element={<CustomOrder />} />
            <Route path="trade-verification" element={<TradeVerification />} />
            <Route path="orders" element={<PurchaseRecords />} />
            <Route path="trading" element={<TradingHistory />} />
            <Route path="userManagement" element={<UserManagement />} />
            <Route path="ActivityLogs" element={<ActivityLogs />} />
            <Route path="stock-request-verification" element={<StockRequestVerification />} />
          </Route>
        </Route>

        {/* Staff-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STAFF']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="stock-request" element={<StockRequest />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;