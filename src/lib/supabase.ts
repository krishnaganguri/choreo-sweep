import { createClient } from '@supabase/supabase-js';

// When using the Lovable Supabase integration, these values are automatically injected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logs to check environment variables
console.log('VITE_SUPABASE_URL available:', !!supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY available:', !!supabaseAnonKey);

// Create a mock/dummy Supabase client for development if env vars aren't available
const mockEnabled = !supabaseUrl || !supabaseAnonKey;

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// If we're using the mock client, override auth methods to simulate functionality
if (mockEnabled) {
  console.warn('⚠️ Using mock Supabase client. Connect your Supabase project in Lovable for full functionality.');
  
  // Override auth methods with mock implementations
  const mockAuth = supabase.auth as any;
  
  // Mock signUp method
  const originalSignUp = mockAuth.signUp;
  mockAuth.signUp = async (params: any) => {
    console.log('Mock signup called with:', params);
    
    // Simulate successful signup
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: params.email,
          user_metadata: params.options?.data || {}
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mock-user-id',
            email: params.email
          }
        }
      },
      error: null
    };
  };
  
  // Mock signIn method
  const originalSignIn = mockAuth.signInWithPassword;
  mockAuth.signInWithPassword = async (params: any) => {
    console.log('Mock sign in called with:', params);
    
    // Simulate successful login
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: params.email
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mock-user-id',
            email: params.email
          }
        }
      },
      error: null
    };
  };
  
  // Mock signOut method
  const originalSignOut = mockAuth.signOut;
  mockAuth.signOut = async () => {
    console.log('Mock sign out called');
    return { error: null };
  };
}

// Define types for your database tables
export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
};

export type Chore = {
  id: number;
  title: string;
  completed: boolean;
  recurring: boolean;
  due_date: string;
  user_id?: string;
  created_at: string;
};

export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
  category: string;
  quantity: number;
  user_id?: string;
  created_at: string;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  user_id?: string;
  created_at: string;
};

export type Reminder = {
  id: number;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  user_id?: string;
  created_at: string;
};
