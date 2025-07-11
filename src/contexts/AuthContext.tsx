import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import type { AuthUser } from '@/types/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const currentUser = authApi.getCurrentUser();
    if (currentUser && authApi.isAuthenticated()) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const response = await authApi.login({ email, password, rememberMe });
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authApi.isAuthenticated(),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};