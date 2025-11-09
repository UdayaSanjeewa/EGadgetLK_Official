'use client';

import { supabase } from './supabase';

export interface User {
  id: string;
  name: string;
  mobile?: string;
  email: string;
  role: 'user' | 'admin' | 'seller';
}

export class AuthManager {
  static async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, role')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      name: profile?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      mobile: profile?.phone,
      role: profile?.role || 'user'
    };
  }

  static async isAdmin(): Promise<boolean> {
    const user = await this.getUser();
    return user?.role === 'admin';
  }

  static async isSeller(): Promise<boolean> {
    const user = await this.getUser();
    return user?.role === 'seller';
  }

  static getDashboardPath(role: 'user' | 'admin' | 'seller'): string {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller/dashboard';
      case 'user':
      default:
        return '/';
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: null }));
  }

  static async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, role')
          .eq('id', data.user.id)
          .maybeSingle();

        const user: User = {
          id: data.user.id,
          name: profile?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          mobile: profile?.phone,
          role: profile?.role || 'user'
        };
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
        return { success: true, user };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  }

  static async signUp(name: string, email: string, password: string, mobile?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      if (!name || name.trim().length < 2) {
        return { success: false, error: 'Name must be at least 2 characters long' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 500));

        await supabase
          .from('profiles')
          .update({
            full_name: name.trim(),
            phone: mobile || '',
            role: 'customer'
          })
          .eq('id', data.user.id);

        const user: User = {
          id: data.user.id,
          name: name.trim(),
          email: data.user.email || '',
          mobile: mobile,
          role: 'user'
        };
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
        return { success: true, user };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  }
}