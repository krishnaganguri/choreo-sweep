export interface Family {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  features_allowed: string[];
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'member';
  features_allowed: string[];
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
  display_name?: string;
}

export interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  purchased: boolean;
  family_id: string;
  created_by: string;
  created_at: string;
  is_personal: boolean;
}

export interface Chore {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  recurring: boolean;
  recurring_interval?: string;
  created_by: string;
  assigned_to?: string;
  family_id: string;
  created_at: string;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  date: string;
  category?: string;
  is_personal: boolean;
  paid: boolean;
  created_by: string;
  assigned_to?: string;
  family_id: string;
  created_at: string;
}

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_by: string;
  created_at: string;
  family_id?: string | null;
  is_personal: boolean;
} 