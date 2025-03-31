
import { createClient } from '@supabase/supabase-js';

// When using the Lovable Supabase integration, these values are automatically injected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logs to check environment variables
console.log('VITE_SUPABASE_URL available:', !!supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY available:', !!supabaseAnonKey);

// Use default empty strings if environment variables are not available
// This prevents the "supabaseUrl is required" error, though the client won't work properly
const fallbackUrl = 'https://placeholder-url.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);

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
