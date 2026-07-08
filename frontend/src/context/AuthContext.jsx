import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile if token exists on boot
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('nutrawell_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        setUser(response.user);
      } catch (err) {
        console.error('Failed to load user session', err);
        localStorage.removeItem('nutrawell_token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('nutrawell_token', response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('nutrawell_token', response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('nutrawell_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.user);
      return response.user;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
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
