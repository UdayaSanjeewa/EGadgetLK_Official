'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            mobile: session.user.user_metadata?.mobile,
            role: session.user.user_metadata?.role || 'user'
          };
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
        } else if (event === 'SIGNED_OUT') {
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: null }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
