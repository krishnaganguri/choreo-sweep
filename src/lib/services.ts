import { supabase } from './supabase';
import type { Chore, GroceryItem, Expense, Reminder, Family, FamilyMember } from './types';
import { NotificationService } from './notifications';

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return null;
  }
  return session.user.id;
};

interface FamilyMemberWithFamily {
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
      if (!userId) return null;

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
      if (!userId) return [];

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          families:families (
            id,
            name,
            created_at,
            created_by
          )
        `)
        .eq('user_id', userId)
        .eq('is_verified', true);

      if (error) {
        console.error('Error fetching families:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Filter out null families and deduplicate by family ID
      const uniqueFamilies = new Map<string, Family>();
      data.forEach(item => {
        if (item.families && typeof item.families === 'object' && 'id' in item.families) {
          uniqueFamilies.set(item.families.id, {
            id: item.families.id,
            name: item.families.name,
            created_at: item.families.created_at,
            created_by: item.families.created_by
          });
        }
      });

      // Convert to array and sort by name
      return Array.from(uniqueFamilies.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error in getFamilies:', error);
      return [];
    }
  },

  async createFamily(name: string) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data: userData } = await supabase.auth.getUser();
      
      // Create the family
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

      if (!familyData) {
        throw new Error('Failed to create family');
      }

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyData.id,
          user_id: userId,
          role: 'admin',
          display_name: userData.user?.email?.split('@')[0] || 'Admin',
          is_verified: true,
          joined_at: new Date().toISOString()
        }]);

      if (memberError) {
        console.error('Error adding family member:', memberError);
        // Clean up the created family if member creation fails
        await supabase.from('families').delete().eq('id', familyData.id);
        throw memberError;
      }

      // Return a properly typed Family object
      return {
        id: familyData.id,
        name: familyData.name,
        created_at: familyData.created_at,
        created_by: familyData.created_by
      } as Family;
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

      return familyMembers.map(member => ({
        ...member,
        user: {
          id: member.user_id,
          email: member.display_name
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

  async updateFamily(familyId: string, name: string) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      // Verify user is admin of the family
      const { data: membership } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .eq('is_verified', true)
        .single();

      if (!membership || membership.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update family details');
      }

      const { data, error } = await supabase
        .from('families')
        .update({ name })
        .eq('id', familyId)
        .select()
        .single();

      if (error) throw error;
      return data as Family;
    } catch (error) {
      console.error('Error in updateFamily:', error);
      throw error;
    }
  },

  async deleteFamily(familyId: string) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      // Verify user is admin of the family
      const { data: membership } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .eq('is_verified', true)
        .single();

      if (!membership || membership.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can delete families');
      }

      // First delete all family members
      const { error: membersError } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId);

      if (membersError) {
        console.error('Error deleting family members:', membersError);
        throw membersError;
      }

      // Then delete the family
      const { error: familyError } = await supabase
        .from('families')
        .delete()
        .eq('id', familyId);

      if (familyError) {
        console.error('Error deleting family:', familyError);
        throw familyError;
      }
    } catch (error) {
      console.error('Error in deleteFamily:', error);
      throw error;
    }
  },
};

// Chores service
export const choresService = {
  async getChores(currentFamily?: { id: string } | null) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      let query = supabase
        .from('chores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (currentFamily === undefined) {
        // All Families view: Show only family chores (no personal chores)
        query = query.eq('is_personal', false);
      } else if (currentFamily === null) {
        // Personal view: Only show personal chores
        query = query.eq('is_personal', true);
      } else {
        // Specific family view: Show only family chores for this family
        query = query.eq('family_id', currentFamily.id).eq('is_personal', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching chores:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChores:', error);
      return [];
    }
  },

  async addChore(chore: Omit<Chore, 'id' | 'created_at' | 'user_id'>) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      // If assigned_to is provided and it's a UUID, keep it as is
      // If it's an email, we need to check if the user exists
      let assignedToValue = chore.assigned_to;
      if (assignedToValue) {
        // Try to find the user by email if assigned_to looks like an email
        if (assignedToValue.includes('@')) {
          const { data: userData } = await supabase
            .from('family_members')
            .select('user_id')
            .eq('family_id', chore.family_id)
            .eq('user_id', assignedToValue)
            .single();
          
          if (userData) {
            assignedToValue = userData.user_id;
          }
        }
      }

      const { data, error } = await supabase
        .from('chores')
        .insert([{
          title: chore.title,
          description: chore.description,
          due_date: chore.due_date,
          priority: chore.priority || 'medium',
          status: chore.status || 'pending',
          assigned_to: assignedToValue,
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
  async getGroceryItems(currentFamilyId?: string | null) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      let query = supabase
        .from('grocery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentFamilyId === undefined) {
        // All Families view: Show only family items (no personal items)
        const { data: familyMemberships } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', userId)
          .eq('is_verified', true);

        const familyIds = familyMemberships?.map(fm => fm.family_id) || [];
        
        if (familyIds.length > 0) {
          query = query.in('family_id', familyIds).eq('is_personal', false);
        } else {
          return [];
        }
      } else if (currentFamilyId === null) {
        // Personal view: Only show personal items
        query = query.eq('user_id', userId).eq('is_personal', true);
      } else {
        // Specific family view: Show only family items for this family
        query = query.eq('family_id', currentFamilyId).eq('is_personal', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching grocery items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getGroceryItems:', error);
      return [];
    }
  },

  async addGroceryItem(item: {
    title: string;
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
          title: item.title,
          quantity: item.quantity || "1",
          category: item.category || "other",
          completed: item.completed || false,
          user_id: userId,
          added_by: userId,
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
    title: string;
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
  async getExpenses(currentFamilyId?: string | null) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      let query = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentFamilyId === undefined) {
        // All Families view: Show only family expenses (no personal expenses)
        const { data: familyMemberships } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', userId)
          .eq('is_verified', true);

        const familyIds = familyMemberships?.map(fm => fm.family_id) || [];
        
        if (familyIds.length > 0) {
          query = query.in('family_id', familyIds).eq('is_personal', false);
        } else {
          return [];
        }
      } else if (currentFamilyId === null) {
        // Personal view: Only show personal expenses
        query = query.eq('user_id', userId).eq('is_personal', true);
      } else {
        // Specific family view: Show only family expenses for this family
        query = query.eq('family_id', currentFamilyId).eq('is_personal', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExpenses:', error);
      return [];
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) {
    try {
      const userId = await getCurrentUserId();

      // If it's a family expense, verify family membership
      if (expense.family_id) {
        const { data: membership } = await supabase
          .from('family_members')
          .select('is_verified')
          .eq('family_id', expense.family_id)
          .eq('user_id', userId)
          .eq('is_verified', true)
          .single();

        if (!membership) {
          throw new Error('Unauthorized: Not a verified member of this family');
        }
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: userId }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Expense;
    } catch (error) {
      console.error('Error in addExpense:', error);
      throw error;
    }
  },

  async updateExpense(id: number, updates: Partial<Expense>) {
    try {
      const userId = await getCurrentUserId();

      // If updating family_id, verify membership
      if (updates.family_id) {
        const { data: membership } = await supabase
          .from('family_members')
          .select('is_verified')
          .eq('family_id', updates.family_id)
          .eq('user_id', userId)
          .eq('is_verified', true)
          .single();

        if (!membership) {
          throw new Error('Unauthorized: Not a verified member of this family');
        }
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Expense;
    } catch (error) {
      console.error('Error in updateExpense:', error);
      throw error;
    }
  },

  async deleteExpense(id: number) {
    try {
      const userId = await getCurrentUserId();

      // Verify ownership before deletion
      const { data: expense } = await supabase
        .from('expenses')
        .select('user_id, family_id')
        .eq('id', id)
        .single();

      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.user_id !== userId) {
        throw new Error('Unauthorized: Cannot delete expense created by another user');
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      throw error;
    }
  }
};

// Reminders service
export const remindersService = {
  async getReminders(currentFamilyId?: string | null) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      let query = supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentFamilyId === undefined) {
        // All Families view: Show only family reminders (no personal reminders)
        const { data: familyMemberships } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', userId)
          .eq('is_verified', true);

        const familyIds = familyMemberships?.map(fm => fm.family_id) || [];
        
        if (familyIds.length > 0) {
          query = query.in('family_id', familyIds).eq('is_personal', false);
        } else {
          return [];
        }
      } else if (currentFamilyId === null) {
        // Personal view: Only show personal reminders
        query = query.eq('user_id', userId).eq('is_personal', true);
      } else {
        // Specific family view: Show only family reminders for this family
        query = query.eq('family_id', currentFamilyId).eq('is_personal', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reminders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReminders:', error);
      return [];
    }
  },

  async addReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'user_id'>) {
    try {
      const userId = await getCurrentUserId();

      // If it's a family reminder, verify family membership
      if (reminder.family_id) {
        const { data: membership } = await supabase
          .from('family_members')
          .select('is_verified')
          .eq('family_id', reminder.family_id)
          .eq('user_id', userId)
          .eq('is_verified', true)
          .single();

        if (!membership) {
          throw new Error('Unauthorized: Not a verified member of this family');
        }
      }

      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...reminder, user_id: userId }])
        .select()
        .single();
      
      if (error) throw error;

      // Schedule notification for the new reminder
      await remindersService.scheduleReminderNotification(data);

      return data as Reminder;
    } catch (error) {
      console.error('Error in addReminder:', error);
      throw error;
    }
  },

  async updateReminder(id: number, updates: Partial<Reminder>) {
    try {
      const userId = await getCurrentUserId();

      // If updating family_id, verify membership
      if (updates.family_id) {
        const { data: membership } = await supabase
          .from('family_members')
          .select('is_verified')
          .eq('family_id', updates.family_id)
          .eq('user_id', userId)
          .eq('is_verified', true)
          .single();

        if (!membership) {
          throw new Error('Unauthorized: Not a verified member of this family');
        }
      }

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
    } catch (error) {
      console.error('Error in updateReminder:', error);
      throw error;
    }
  },

  async deleteReminder(id: number) {
    try {
      const userId = await getCurrentUserId();

      // Verify ownership before deletion
      const { data: reminder } = await supabase
        .from('reminders')
        .select('user_id, family_id')
        .eq('id', id)
        .single();

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      if (reminder.user_id !== userId) {
        throw new Error('Unauthorized: Cannot delete reminder created by another user');
      }

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
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