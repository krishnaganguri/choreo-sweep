import { createClient } from '@supabase/supabase-js';
import type { Family, FamilyMember, Chore, GroceryItem, Expense, Reminder } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client with essential configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for your database tables
export type Profile = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
};

export type { Family, FamilyMember, Chore, GroceryItem, Expense, Reminder };
