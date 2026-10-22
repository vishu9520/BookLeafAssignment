import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bookleaf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bookleaf_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', handleLogoutEvent);

    // Verify session if token exists
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.data.user);
          localStorage.setItem('bookleaf_user', JSON.stringify(res.data.data.user));
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('bookleaf_access_token');
          localStorage.removeItem('bookleaf_refresh_token');
          localStorage.removeItem('bookleaf_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken, refreshToken } = res.data.data;

    localStorage.setItem('bookleaf_access_token', accessToken);
    localStorage.setItem('bookleaf_refresh_token', refreshToken);
    localStorage.setItem('bookleaf_user', JSON.stringify(userData));

    setUser(userData);
    setToken(accessToken);
    return userData;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('bookleaf_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.warn('Logout notification failed', err);
    } finally {
      localStorage.removeItem('bookleaf_access_token');
      localStorage.removeItem('bookleaf_refresh_token');
      localStorage.removeItem('bookleaf_user');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
