import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { auth } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<RegisterData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await auth.getProfile();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user } = await auth.login(credentials);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    const { user } = await auth.register(data);
    setUser(user);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<RegisterData>) => {
    const updatedUser = await auth.updateProfile(updates);
    setUser(updatedUser);
  };

  const contextValue = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 