/**
 * Clean Google OAuth 2.0 AuthContext (Firebase Fully Removed)
 * 
 * ====================================================================
 * DELETED FIREBASE FILES CLEANUP LOG:
 * ====================================================================
 * The following Firebase-only files and configurations were fully removed:
 * 1. c:\IRIS\frontend\src\services\firebase.js (Deleted)
 * 2. All firebase packages (firebase, @firebase/auth, etc.) uninstalled
 * 3. All Firebase imports, setup modals, and providers purged from codebase
 * ====================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../services/sendMessageToBackend';

const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = 'iris_auth_token';

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) return null;
    const payload = decodeJwt(savedToken);
    if (!payload) return null;
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || "User",
      picture: payload.picture || null
    };
  });
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // On mount, verify and rehydrate user with backend
  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const verifyStoredToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token: storedToken })
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted && data?.user) {
            setUser(data.user);
            setToken(storedToken);
          }
        } else if (response.status === 401) {
          // Token expired or invalid
          console.warn("[AuthContext] Stored token expired or invalid (401)");
          if (isMounted) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setUser(null);
            setToken(null);
            setSessionExpired(true);
          }
        }
      } catch (err) {
        console.warn("[AuthContext] Backend token verification failed, using local payload if valid:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyStoredToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentialResponse) => {
    const rawToken = credentialResponse?.credential;
    if (!rawToken) {
      throw new Error("No credential received from Google login");
    }

    // 1. Decode locally for instant UI update
    const payload = decodeJwt(rawToken);
    const initialUser = payload ? {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || "User",
      picture: payload.picture || null
    } : null;

    setToken(rawToken);
    setUser(initialUser);
    localStorage.setItem(AUTH_TOKEN_KEY, rawToken);
    setSessionExpired(false);

    // 2. Server-side verification
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: rawToken })
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setUser(data.user);
          return data.user;
        }
      } else if (response.status === 401) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || "Server rejected Google authentication token");
      }
    } catch (err) {
      console.warn("[AuthContext] Server verification warning:", err);
    }

    return initialUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setSessionExpired(false);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      sessionExpired,
      setSessionExpired,
      login,
      logout
    }}>
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
