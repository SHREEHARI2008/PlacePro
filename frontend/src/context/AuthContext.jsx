import React, { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cpms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(email, password);
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('cpms_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        const errMsg = res.data?.error || 'Invalid credentials';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to connect to authentication server';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register(payload);
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('cpms_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        const errMsg = res.data?.error || 'Registration failed';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to register account';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (ignored) {}
    setUser(null);
    localStorage.removeItem('cpms_user');
  };

  const updateCurrentUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('cpms_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
