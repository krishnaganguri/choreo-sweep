
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('Sign in response:', { error, data });
      
      if (error) {
        throw error;
      }
      
      // Update the session and user state immediately
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      
      // Use sonner toast for better visual feedback
      toast.success("Welcome back!", {
        description: "You have successfully signed in to HomeSync.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error("Sign in failed", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Create a profile record
        await supabase.from('profiles').insert([
          { id: data.user.id, username, created_at: new Date().toISOString() }
        ]);
        
        // Use sonner toast for better visual feedback
        toast.success("Account created", {
          description: "Please check your email to verify your account.",
          duration: 5000
        });
        
        navigate('/login');
      }
    } catch (error: any) {
      toast.error("Sign up failed", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset email sent", {
        description: "Check your email for a link to reset your password.",
        duration: 5000
      });
      
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Use sonner toast for better visual feedback
      toast.success("Signed out", {
        description: "You have been successfully signed out.",
      });
      
      navigate('/login');
    } catch (error: any) {
      toast.error("Sign out failed", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
