/**
 * API base URL (no trailing slash).
 * Local: http://127.0.0.1:8000
 * Production (Vercel): set REACT_APP_API_URL=https://your-app.up.railway.app
 */
const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

/** Strip trailing slash and accidental /api suffix (OAuth lives at /connect/google, not /api/...). */
function normalizeApiBase(url) {
  let base = (url || DEFAULT_API_BASE).replace(/\/$/, '');
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  }
  return base;
}

export const API_BASE_URL = normalizeApiBase(process.env.REACT_APP_API_URL);

/** Symfony API prefix, e.g. https://api.example.com/api */
export const API_URL = `${API_BASE_URL}/api`;

function deriveWsBase(httpBase) {
  if (!httpBase) return '';
  if (httpBase.includes('127.0.0.1') || httpBase.includes('localhost')) {
    return 'ws://127.0.0.1:8080';
  }
  if (httpBase.startsWith('https://')) {
    return httpBase.replace(/^https:\/\//, 'wss://');
  }
  if (httpBase.startsWith('http://')) {
    return httpBase.replace(/^http:\/\//, 'ws://');
  }
  return '';
}

export const WS_URL = process.env.REACT_APP_WS_URL || deriveWsBase(API_BASE_URL);

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
