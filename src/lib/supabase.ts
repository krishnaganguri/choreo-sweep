import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create the Supabase client with essential configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Define types for your database tables
export type Profile = {
  id: string;
  username: string;
  email: string;
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
