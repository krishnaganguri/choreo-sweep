import { supabase } from './supabase';
import type { Chore, GroceryItem, Expense, Reminder, Family, FamilyMember } from './types';
import { NotificationService } from './notifications';

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }
  return session.user.id;
};

interface FamilyResponse {
  family: {
    id: string;
    name: string;
    created_at: string;
    created_by: string;
  } | null;
}

// Family service
export const familyService = {
  async getCurrentFamily() {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          family:families (
            id,
            name,
            created_at,
            created_by
          )
        `)
        .eq('user_id', userId.toString())
        .eq('is_verified', true)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current family:', error);
        return null;
      }

      return data?.family || null;
    } catch (error) {
      console.error('Error in getCurrentFamily:', error);
      return null;
    }
  },

  async getFamilies() {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          family:families (
            id,
            name,
            created_at,
            created_by
          )
        `)
        .eq('user_id', userId.toString())
        .eq('is_verified', true);

      if (error) {
        console.error('Error fetching families:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Safely transform the data
      return data
        .map(item => item.family)
        .filter((family: unknown): family is Family => 
          family !== null &&
          typeof family === 'object' &&
          family !== null &&
          'id' in family &&
          'name' in family &&
          'created_at' in family &&
          'created_by' in family &&
          typeof family.id === 'string' &&
          typeof family.name === 'string' &&
          typeof family.created_at === 'string' &&
          typeof family.created_by === 'string'
        );
    } catch (error) {
      console.error('Error in getFamilies:', error);
      return [];
    }
  },

  async createFamily(name: string) {
    try {
      const userId = await getCurrentUserId();
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{
          name,
          created_by: userId
        }])
        .select()
        .single();

      if (familyError) {
        console.error('Error creating family:', familyError);
        throw familyError;
      }

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyData.id,
          user_id: userId.toString(),
          role: 'admin',
          display_name: userData.user.email?.split('@')[0] || 'Admin',
          is_verified: true
        }]);

      if (memberError) {
        console.error('Error adding family member:', memberError);
        throw memberError;
      }

      // Ensure we return a properly typed Family object
      const family: Family = {
        id: familyData.id,
        name: familyData.name,
        created_at: familyData.created_at,
        created_by: familyData.created_by
      };

      return family;
    } catch (error) {
      console.error('Error in createFamily:', error);
      throw error;
    }
  },

  async addFamilyMember(familyId: string, email: string, role: 'admin' | 'member' = 'member') {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          user_id: email, // Use email as user_id for now
          role,
          display_name: email.split('@')[0],
          is_verified: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding family member:', error);
        throw error;
      }

      return data as FamilyMember;
    } catch (error) {
      console.error('Error in addFamilyMember:', error);
      throw error;
    }
  },

  async getFamilyMembers(familyId: string) {
    try {
      const { data: familyMembers, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId);

      if (membersError) {
        console.error('Error fetching family members:', membersError);
        return [];
      }

      if (!familyMembers) {
        return [];
      }

      // Transform the data to include user info
      return familyMembers.map(member => ({
        ...member,
        user: {
          id: member.user_id,
          email: member.display_name // Use display_name as fallback since we don't have email
        }
      })) as (FamilyMember & { user: { id: string; email: string } })[];
    } catch (error) {
      console.error('Error in getFamilyMembers:', error);
      return [];
    }
  },

  async updateMemberRole(familyId: string, userId: string, role: 'admin' | 'member') {
    try {
      const currentUserId = await getCurrentUserId();
      
      // Check if the current user is an admin in this family
      const { data: adminCheck, error: adminError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', currentUserId.toString())
        .eq('is_verified', true)
        .single();

      if (adminError || !adminCheck || adminCheck.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update member roles');
      }

      const { data, error } = await supabase
        .from('family_members')
        .update({ role })
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as FamilyMember;
    } catch (error) {
      console.error('Error in updateMemberRole:', error);
      throw error;
    }
  },

  async removeFamilyMember(familyId: string, userId: string) {
    try {
      const currentUserId = await getCurrentUserId();
      
      // Check if the current user is an admin in this family
      const { data: adminCheck, error: adminError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', currentUserId.toString())
        .eq('is_verified', true)
        .single();

      if (adminError || !adminCheck || adminCheck.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can remove family members');
      }

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in removeFamilyMember:', error);
      throw error;
    }
  },

  async updateDisplayName(familyId: string, userId: string, displayName: string) {
    const { data, error } = await supabase
      .from('family_members')
      .update({ display_name: displayName })
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as FamilyMember;
  },

  async getPendingInvitations() {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          family:families (
            id,
            name,
            created_at,
            created_by
          )
        `)
        .eq('user_id', userId.toString())
        .eq('is_verified', false);

      if (error) {
        console.error('Error fetching pending invitations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingInvitations:', error);
      return [];
    }
  },

  async acceptInvitation(familyId: string) {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('family_members')
        .update({ is_verified: true })
        .eq('family_id', familyId)
        .eq('user_id', userId.toString())
        .select()
        .single();

      if (error) {
        console.error('Error accepting invitation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      throw error;
    }
  },

  async declineInvitation(familyId: string) {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId.toString())
        .eq('is_verified', false);

      if (error) {
        console.error('Error declining invitation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in declineInvitation:', error);
      throw error;
    }
  },
};

// Chores service
export const choresService = {
  async getChores() {
    try {
      const userId = await getCurrentUserId();
      const family = await familyService.getCurrentFamily();

      let filter = `user_id.eq.${userId}`;
      if (family && typeof family === 'object' && 'id' in family) {
        filter = `user_id.eq.${userId},or(family_id.eq.${family.id},is_personal.eq.false)`;
      }

      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .or(filter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chores:', error);
        return [];
      }

      return data as Chore[];
    } catch (error) {
      console.error('Error in getChores:', error);
      return [];
    }
  },

  async addChore(chore: Omit<Chore, 'id' | 'created_at' | 'user_id'>) {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('chores')
        .insert([{
          title: chore.title,
          description: chore.description,
          due_date: chore.due_date,
          priority: chore.priority || 'medium',
          status: chore.status || 'pending',
          assigned_to: chore.assigned_to,
          family_id: chore.family_id,
          is_personal: chore.is_personal,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding chore:', error);
        throw error;
      }

      return data as Chore;
    } catch (error) {
      console.error('Error in addChore:', error);
      throw error;
    }
  },

  async updateChore(id: number, updates: Partial<Chore>) {
    try {
      const { data, error } = await supabase
        .from('chores')
        .update({
          ...updates,
          // Ensure we're not sending any old fields
          completed: undefined,
          recurring: undefined,
          recurring_interval: undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating chore:', error);
        throw error;
      }

      return data as Chore;
    } catch (error) {
      console.error('Error in updateChore:', error);
      throw error;
    }
  },

  async deleteChore(id: number) {
    try {
      const { error } = await supabase
        .from('chores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting chore:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteChore:', error);
      throw error;
    }
  },

  scheduleChoreNotifications: async (chore: Chore) => {
    const notificationService = NotificationService.getInstance();

    if (chore.due_date) {
      // Schedule notification for 1 day before due date
      const oneDayBefore = new Date(chore.due_date);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      
      if (oneDayBefore > new Date()) {
        notificationService.scheduleNotification(
          `Chore Due Tomorrow: ${chore.title}`,
          oneDayBefore,
          {
            body: `Don't forget to ${chore.title.toLowerCase()}`,
            tag: `chore-${chore.id}-reminder`,
          }
        );
      }

      // Schedule notification for due date
      const dueDate = new Date(chore.due_date);
      if (dueDate > new Date()) {
        notificationService.scheduleNotification(
          `Chore Due Today: ${chore.title}`,
          dueDate,
          {
            body: `${chore.title} is due today`,
            tag: `chore-${chore.id}-due`,
          }
        );
      }
    }
  },
};

// Groceries service
export const groceriesService = {
  async getGroceryItems() {
    try {
      const userId = await getCurrentUserId();
      const family = await familyService.getCurrentFamily();

      let filter = `user_id.eq.${userId}`;
      if (family && typeof family === 'object' && 'id' in family) {
        filter = `user_id.eq.${userId},family_id.eq.${family.id}`;
      }

      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .or(filter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching grocery items:', error);
        return [];
      }
      return data as GroceryItem[];
    } catch (error) {
      console.error('Error in getGroceryItems:', error);
      return [];
    }
  },

  async addGroceryItem(item: {
    name: string;
    quantity?: string;
    category?: string;
    completed?: boolean;
    is_personal: boolean;
    family_id?: string;
  }) {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('grocery_items')
        .insert([{
          name: item.name,
          quantity: item.quantity || "1",
          category: item.category || "other",
          completed: item.completed || false,
          user_id: userId,
          is_personal: item.is_personal,
          family_id: item.family_id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding grocery item:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in addGroceryItem:', error);
      throw error;
    }
  },

  async updateGroceryItem(id: number, updates: Partial<{
    name: string;
    quantity: string;
    category: string;
    completed: boolean;
    is_personal: boolean;
    family_id: string;
  }>) {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('grocery_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating grocery item:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in updateGroceryItem:', error);
      throw error;
    }
  },

  async deleteGroceryItem(id: number) {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

// Expenses service
export const expensesService = {
  async getExpenses() {
    try {
      const userId = await getCurrentUserId();
      const family = await familyService.getCurrentFamily();

      let filter = `user_id.eq.${userId}`;
      if (family && typeof family === 'object' && 'id' in family) {
        filter = `user_id.eq.${userId},or(family_id.eq.${family.id},is_personal.eq.false)`;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .or(filter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      return data as Expense[];
    } catch (error) {
      console.error('Error in getExpenses:', error);
      return [];
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Expense;
  },

  async updateExpense(id: number, updates: Partial<Expense>) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Expense;
  },

  async deleteExpense(id: number) {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

// Reminders service
export const remindersService = {
  async getReminders() {
    try {
      const userId = await getCurrentUserId();
      const family = await familyService.getCurrentFamily();

      let filter = `user_id.eq.${userId}`;
      if (family && typeof family === 'object' && 'id' in family) {
        filter = `user_id.eq.${userId},or(family_id.eq.${family.id},is_personal.eq.false)`;
      }

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .or(filter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reminders:', error);
        return [];
      }
      return data as Reminder[];
    } catch (error) {
      console.error('Error in getReminders:', error);
      return [];
    }
  },

  async addReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'user_id'>) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ ...reminder, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;

    // Schedule notification for the new reminder
    await remindersService.scheduleReminderNotification(data);

    return data as Reminder;
  },

  async updateReminder(id: number, updates: Partial<Reminder>) {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;

    // Reschedule notification for the updated reminder
    await remindersService.scheduleReminderNotification(data);

    return data as Reminder;
  },

  async deleteReminder(id: number) {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  scheduleReminderNotification: async (reminder: Reminder) => {
    const notificationService = NotificationService.getInstance();

    if (reminder.date && reminder.time) {
      const [year, month, day] = reminder.date.split('-');
      const [hours, minutes] = reminder.time.split(':');
      const reminderTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      
      if (reminderTime > new Date()) {
        notificationService.scheduleNotification(
          reminder.title,
          reminderTime,
          {
            body: `Priority: ${reminder.priority}`,
            tag: `reminder-${reminder.id}`,
          }
        );
      }
    }
  },
}; 