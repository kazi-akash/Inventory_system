'use client';

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '@/lib/api/auth';
import { getAccessToken, clearTokens } from '@/lib/api/client';
import type { User, LoginRequest, RegisterRequest } from '@/lib/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    await authApi.login(credentials);
    await fetchUser();
  }, [fetchUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
    // Auto-login after registration
    await login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }), [user, isLoading, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
