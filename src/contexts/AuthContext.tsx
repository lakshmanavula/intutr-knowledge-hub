import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import type { AuthUser } from '@/types/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
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
    const initializeAuth = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const currentUser = authApi.getCurrentUser();
        if (currentUser && authApi.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user on app start:', error);
        // Clear any invalid auth data safely
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        } catch (storageError) {
          console.error('Error clearing auth storage:', storageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string, rememberMe?: boolean) => {
    const response = await authApi.login({ email: username, password });
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