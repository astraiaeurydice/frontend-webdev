/**
 * API base URL (no trailing slash).
 * Local: http://127.0.0.1:8000
 * Production (Vercel): set REACT_APP_API_URL=https://your-app.up.railway.app
 */
const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE).replace(
  /\/$/,
  ''
);

/** Symfony API prefix, e.g. https://api.example.com/api */
export const API_URL = `${API_BASE_URL}/api`;

/** Product/upload paths stored as /uploads/... on the backend */
export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function googleOAuthUrl() {
  return `${API_BASE_URL}/connect/google`;
}
