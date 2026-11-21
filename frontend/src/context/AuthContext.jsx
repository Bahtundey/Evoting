import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService.js';
import { getToken, setToken, clearToken } from '../services/tokenStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load (fetch from the backend, not just the
  // stored token), and react to forced logouts dispatched by the interceptor.
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (token) {
        try {
          const { data } = await authService.getMe();
          setUser(data.data);
        } catch {
          clearToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    restore();

    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password, remember = true) => {
    const { data } = await authService.login(email, password);
    setToken(data.data.token, remember);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // Registration only creates the account — it does NOT log the user in and
  // stores no token, so a new voter must sign in manually afterwards.
  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    return data.data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.data);
    } catch {
      /* session expired — the interceptor clears the token */
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
