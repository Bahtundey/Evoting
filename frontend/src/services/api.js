import axios from 'axios';
import { getToken, clearToken } from './tokenStore.js';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Fail fast with a clear configuration error if the API URL is missing —
// never silently fall back to a localhost/dev URL.
if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_URL is not configured. Set it in frontend/.env (development) or frontend/.env.production (production).'
  );
}

// Backend base URL. MUST be set via VITE_API_URL (frontend/.env for local dev,
// the Vercel environment in production). No localhost fallback so a missing
// variable fails loudly instead of silently pointing at localhost.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to every request automatically.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid sessions centrally: clear the token and let the
// AuthContext (which listens for 'auth:logout') reset the user state.
// Auth endpoints are excluded so a bad login shows an inline error instead
// of triggering a logout/redirect loop.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthRequest) {
      clearToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
