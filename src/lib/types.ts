export interface Family {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'member';
  display_name: string;
  is_verified: boolean;
  joined_at: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface GroceryItem {
  id: number;
  title: string;
  quantity: string;
  category: string;
  completed: boolean;
  is_personal: boolean;
  family_id?: string;
  created_at: string;
  user_id: string;
}

export interface Chore {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  is_personal: boolean;
  family_id?: string;
  assigned_to?: string | null;
  created_at: string;
  user_id: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  user_id: string;
  family_id?: string;
  is_personal: boolean;
  created_at: string;
}

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  user_id: string;
  family_id?: string;
  is_personal: boolean;
  created_at: string;
} 