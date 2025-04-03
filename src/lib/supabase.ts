import { createClient } from '@supabase/supabase-js';

// When using the Lovable Supabase integration, these values are automatically injected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// Create a mock/dummy Supabase client for development if env vars aren't available
const mockEnabled = !supabaseUrl || !supabaseAnonKey;

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Create a mock session for development
const createMockSession = (email: string) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: new Date().getTime() + 3600,
  expires_in: 3600,
  user: {
    id: 'mock-user-id',
    email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  }
});

// If we're using the mock client, override auth methods to simulate functionality
if (mockEnabled) {
  console.warn('⚠️ Using mock Supabase client. Connect your Supabase project in Lovable for full functionality.');
  
  // Store mock session in memory
  let mockSession: any = null;
  
  // Override auth methods with mock implementations
  const mockAuth = supabase.auth as any;
  
  // Override getSession
  const originalGetSession = mockAuth.getSession;
  mockAuth.getSession = async () => {
    console.log('Mock getSession called, returning:', mockSession);
    return {
      data: {
        session: mockSession
      },
      error: null
    };
  };
  
  // Mock signUp method
  const originalSignUp = mockAuth.signUp;
  mockAuth.signUp = async (params: any) => {
    console.log('Mock signup called with:', params);
    
    // Create a mock session
    mockSession = createMockSession(params.email);
    
    // Simulate successful signup
    return {
      data: {
        user: mockSession.user,
        session: mockSession
      },
      error: null
    };
  };
  
  // Mock signIn method
  const originalSignIn = mockAuth.signInWithPassword;
  mockAuth.signInWithPassword = async (params: any) => {
    console.log('Mock sign in called with:', params);
    
    // Create a mock session
    mockSession = createMockSession(params.email);
    
    // Simulate successful login
    return {
      data: {
        user: mockSession.user,
        session: mockSession
      },
      error: null
    };
  };
  
  // Mock signOut method
  const originalSignOut = mockAuth.signOut;
  mockAuth.signOut = async () => {
    console.log('Mock sign out called');
    mockSession = null;
    return { error: null };
  };
  
  // Mock onAuthStateChange
  const originalOnAuthStateChange = mockAuth.onAuthStateChange;
  mockAuth.onAuthStateChange = (callback: any) => {
    console.log('Mock onAuthStateChange registered');
    // Return a dummy subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => console.log('Mock unsubscribe called')
        }
      }
    };
  };
  
  // Mock resetPasswordForEmail method
  mockAuth.resetPasswordForEmail = async (email: string, options: any) => {
    console.log('Mock reset password called for:', email, options);
    return { error: null };
  };
  
  // Mock updateUser method
  mockAuth.updateUser = async (params: any) => {
    console.log('Mock update user called with:', params);
    if (mockSession) {
      if (params.password) {
        console.log('Updating mock password');
      }
    }
    return {
      data: {
        user: mockSession?.user || {
          id: 'mock-user-id',
          email: 'mock@example.com'
        }
      },
      error: null
    };
  };
}

// Define types for your database tables
export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
};

export type Family = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  display_name: string;
};

export type Chore = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  recurring: boolean;
  recurring_interval?: string;
  user_id: string;
  family_id?: string;
  assigned_to?: string;
  created_at: string;
  is_personal: boolean;
};

export type GroceryItem = {
  id: number;
  title: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
  user_id: string;
  family_id?: string;
  added_by: string;
  created_at: string;
  notes?: string;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  user_id: string;
  family_id?: string;
  is_personal: boolean;
  split_type?: 'equal' | 'custom';
  split_with?: string[];
  created_at: string;
  notes?: string;
};

export type Reminder = {
  id: number;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  user_id: string;
  family_id?: string;
  is_personal: boolean;
  notify_family?: boolean;
  created_at: string;
};
