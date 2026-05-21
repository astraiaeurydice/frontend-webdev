// src/components/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

function getStoredRoles() {
  const raw = localStorage.getItem("roles");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(normalizeRole).filter(Boolean);
    if (typeof parsed === "string") return parsed.split(",").map(normalizeRole).filter(Boolean);
    return [];
  } catch {
    return raw.split(",").map(normalizeRole).filter(Boolean);
  }
}

function normalizeRole(role) {
  if (role == null) return "";
  let r = String(role).trim();
  if (!r) return "";
  r = r.toUpperCase();
  if (!r.startsWith("ROLE_")) r = `ROLE_${r}`;
  return r;
}

export default function PublicRoute() {
  const token = localStorage.getItem("token");
  const userRoles = getStoredRoles();

  if (token) {
    if (userRoles.includes("ROLE_ADMIN")) {
      return <Navigate to="/admin/dashboard" replace />;
    } 
    else if (userRoles.includes("ROLE_STAFF")) {
      return <Navigate to="/admin/dashboard" replace />;
    } 
    else if (userRoles.includes("ROLE_ADMIN")) {
      return <Navigate to="/supplier/dashboard" replace />;
    } 
    else if (userRoles.includes("ROLE_MEDIATOR")) {
      return <Navigate to="/mediator/dashboard" replace />;
    } 
    else {
      return <Navigate to="/customer/dashboard" replace />;
    }
  }

  // Not logged in, show the public page (login)
  return <Outlet />;
}