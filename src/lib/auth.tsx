import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Set user immediately after successful sign in
      if (data.user) {
        setUser(data.user);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error instanceof AuthError) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
      }
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // First check if email exists in profiles
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingProfiles) {
        throw new Error('This email is already registered');
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered');
        }
        throw error;
      }

      // Create a profile record if signup was successful
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              username: username || email.split('@')[0],
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw here as the user is already created
          toast.error('Profile creation failed', {
            description: 'Your account was created but profile setup failed. Please contact support.',
          });
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state after successful sign out
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 