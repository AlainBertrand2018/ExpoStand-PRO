
"use client";

import type { User, AuthContextType } from '@/lib/types';
import { USERS, LOCAL_STORAGE_AUTH_KEY } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (storedUser) {
        const parsedUser: Omit<User, 'password'> = JSON.parse(storedUser);
        // Re-validate or fetch full user details if needed, for now just use stored
        // For security, never store password in localStorage.
        // The USERS constant here is a mock, in real app, you'd verify against a backend.
        const validatedUser = USERS.find(u => u.id === parsedUser.id);
        if (validatedUser) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userToStore } = validatedUser;
          setCurrentUser(userToStore);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password_provided: string): Promise<boolean> => {
    setIsLoading(true);
    const userInDb = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (userInDb && userInDb.password === password_provided) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userToStore } = userInDb; // Exclude password from stored object
      setCurrentUser(userToStore);
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(userToStore));
      setIsLoading(false);
      return true;
    }
    setCurrentUser(null);
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    router.push('/login');
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
