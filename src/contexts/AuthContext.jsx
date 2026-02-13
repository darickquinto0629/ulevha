import React, { createContext, useState, useCallback, useEffect } from 'react';
import { getApiUrl, apiCall } from '@/lib/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // Start with loading=true if we have a token to verify, false otherwise
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));
  const [error, setError] = useState(null);

  // Initialize auth state on mount - verify stored token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('[AuthContext] initializeAuth running, token exists:', !!storedToken);
      
      if (!storedToken) {
        console.log('[AuthContext] No token found, skipping verification');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = getApiUrl();
        console.log('[AuthContext] Verifying token with URL:', apiUrl + '/auth/verify');
        
        const response = await fetch(`${apiUrl}/auth/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        console.log('[AuthContext] Verify response status:', response.status);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.log('[AuthContext] Verify failed:', response.status, errData);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[AuthContext] Verify succeeded, user:', data.data?.email);
        
        if (data.success) {
          setToken(storedToken);
          setUser(data.data);
          console.log('[AuthContext] State updated - token and user set, loading->false');
        } else {
          console.log('[AuthContext] Verify returned false success');
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] Token verification failed with error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('[AuthContext] Loading set to false');
      }
    };

    initializeAuth();
  }, []);

  // Verify token - called when needed, doesn't depend on state
  const verifyToken = useCallback(async (tokenToVerify) => {
    const verifyTokenValue = tokenToVerify || localStorage.getItem('token');
    if (!verifyTokenValue) return;

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${verifyTokenValue}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (err) {
      console.error('[AuthContext] Token verification failed:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Login failed';
        console.error('[AuthContext] Login failed:', errorMsg);
        throw new Error(errorMsg);
      }

      if (data.success) {
        const { token: newToken, user: userData } = data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        console.log('[AuthContext] Login successful:', userData.email);
        return { success: true, data };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      console.error('[AuthContext] Login error:', errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Registration failed';
        console.error('[AuthContext] Registration failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[AuthContext] Registration successful');
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      console.error('[AuthContext] Registration error:', errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
