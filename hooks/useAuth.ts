'use client';

import { useState, useEffect } from 'react';
import { User, AuthManager } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await AuthManager.getUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();

    // Listen for auth state changes
    const handleAuthChange = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener('authStateChanged', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await AuthManager.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signUp = async (name: string, email: string, password: string, mobile?: string) => {
    const result = await AuthManager.signUp(name, email, password, mobile);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signOut = () => {
    AuthManager.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
}