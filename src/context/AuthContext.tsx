import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {
  clearAuthToken,
  fetchCurrentSession,
  loginAccount,
  logoutAccount,
  PublicUser,
  registerAccount,
} from '../services/authApi';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  register: (contact: string, password: string) => Promise<PublicUser>;
  login: (contact: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await fetchCurrentSession();
        if (!active) return;
        setUser(session.authenticated ? session.user : null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const register = useCallback(async (contact: string, password: string): Promise<PublicUser> => {
    const res = await registerAccount(contact, password);
    if (!res.user) {
      throw new Error('REGISTER_FAILED');
    }
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback(async (contact: string, password: string): Promise<PublicUser> => {
    const res = await loginAccount(contact, password);
    if (!res.user) {
      throw new Error('INVALID_CREDENTIALS');
    }
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAccount();
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isOwner: user?.role === 'owner',
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
