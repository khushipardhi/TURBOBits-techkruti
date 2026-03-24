import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';

const AuthContext = createContext(null);

// Decode JWT payload without verifying signature (client-side only)
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Check if a JWT token is expired
function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return decoded.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Called by api.js when any request gets a 401
  const handleUnauthorized = useCallback(() => {
    console.warn('🔒 Session expired — logging out');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('foodlink_token');
    localStorage.removeItem('foodlink_user');
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('foodlink_token');
    const storedUser = localStorage.getItem('foodlink_user');

    if (storedToken && storedUser) {
      // Check if token is expired before restoring
      if (isTokenExpired(storedToken)) {
        console.warn('🔒 Stored token is expired — clearing session');
        localStorage.removeItem('foodlink_token');
        localStorage.removeItem('foodlink_user');
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ Session restored for:', parsedUser.name, '| Role:', parsedUser.role);
      } catch {
        console.error('❌ Failed to parse stored user — clearing session');
        localStorage.removeItem('foodlink_token');
        localStorage.removeItem('foodlink_user');
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('foodlink_token', authToken);
    localStorage.setItem('foodlink_user', JSON.stringify(userData));
    console.log('✅ Logged in as:', userData.name, '| Role:', userData.role);
  }, []);

  const register = useCallback((userData, authToken) => {
    login(userData, authToken);
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('foodlink_token');
    localStorage.removeItem('foodlink_user');
    console.log('👋 Logged out');
  }, []);

  // Refresh user profile from server (keeps data fresh after token restore)
  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('foodlink_token');
    if (!storedToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const freshUser = data.data;
        setUser(freshUser);
        localStorage.setItem('foodlink_user', JSON.stringify(freshUser));
        console.log('🔄 Profile refreshed for:', freshUser.name);
      }
    } catch (err) {
      console.warn('⚠️ Profile refresh failed (offline?):', err.message);
    }
  }, [handleUnauthorized]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    handleUnauthorized,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
