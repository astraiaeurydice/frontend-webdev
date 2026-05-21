import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function pickDashboard(roles) {
  if (roles.includes("ROLE_ADMIN") || roles.includes("ROLE_STAFF")) return "/admin/dashboard";
  if (roles.includes("ROLE_SUPPLIER")) return "/supplier/dashboard";
  if (roles.includes("ROLE_MEDIATOR")) return "/mediator/dashboard";
  return "/customer/dashboard";
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const token = params.get("token");
    const rolesRaw = params.get("roles");
    const userRaw = params.get("user");

    if (!token) {
      navigate("/login?error=missing_token", { replace: true });
      return;
    }

    const roles = safeJsonParse(rolesRaw || "[]", []);
    const user = safeJsonParse(userRaw || "null", null);

    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(Array.isArray(roles) ? roles : []));
    if (user) localStorage.setItem("user", JSON.stringify(user));

    navigate(pickDashboard(Array.isArray(roles) ? roles : []), { replace: true });
  }, [navigate, params]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-lg font-semibold">Signing you in…</div>
    </div>
  );
}

