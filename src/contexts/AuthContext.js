'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const userData = JSON.parse(text);
            setUser(userData.user);
            setIsAuthenticated(true);
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError, 'Response:', text);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.error('Empty response from auth check');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear auth cookie
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    updateUser,
    logout,
    refreshAuth: checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
