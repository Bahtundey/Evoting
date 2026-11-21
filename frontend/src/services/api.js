import axios from 'axios';
import { getToken, clearToken } from './tokenStore.js';

// Backend base URL, configurable via VITE_API_URL in frontend/.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

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
