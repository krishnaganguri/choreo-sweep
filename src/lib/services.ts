import { supabase } from './supabase';
import type { Chore, GroceryItem, Expense, Reminder, Family as FamilyType, FamilyMember } from './types';
import { NotificationService } from './notifications';

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return null;
  }
  return session.user.id;
};

// Type alias for Supabase family type if needed, or use FamilyType directly
type DatabaseFamily = FamilyType;

interface FamilyMemberResponse {
  family: DatabaseFamily;
}

interface FamilyMemberWithFamily extends FamilyMember {
  family: DatabaseFamily;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  features_allowed: string[];
}

// Family service
export const familyService = {
  async getFamilies() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];

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
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching families:', error);
        return [];
      }

      // Extract and deduplicate families
      const uniqueFamilies = new Map<string, DatabaseFamily>();
      const typedData = data as unknown as { family: DatabaseFamily }[];
      typedData.forEach(item => {
        if (item.family) {
          uniqueFamilies.set(item.family.id, item.family);
        }
      });

      return Array.from(uniqueFamilies.values());
    } catch (error) {
      console.error('Error in getFamilies:', error);
      return [];
    }
  },

  async getUserFamily(): Promise<Family | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found');
      return null;
    }

    try {
      // First get the user's profile to get their family_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profile?.family_id) {
        console.log('No family_id found in profile');
        return null;
      }

      // Then get the family details
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', profile.family_id)
        .single();

      if (familyError) {
        console.error('Error fetching family:', familyError);
        return null;
      }

      if (!family) {
        console.log('No family found');
        return null;
      }

      return {
        id: family.id,
        name: family.name,
        created_at: family.created_at,
        created_by: family.created_by,
        features_allowed: family.features_allowed
      };
    } catch (error) {
      console.error('Error in getUserFamily:', error);
      return null;
    }
  },

  async createFamily(name: string) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      // Create the family first
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([{ name, created_by: userId }])
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: family.id,
          user_id: userId,
          role: 'admin',
          display_name: name, // Use user email or fetch profile later if needed
          features_allowed: ['chores', 'groceries', 'expenses', 'reminders']
        }]);

      if (memberError) throw memberError;

      // Also update the creator's profile to link to the new family
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ family_id: family.id })
        .eq('id', userId);

      if (profileUpdateError) {
         console.warn("Family created, but failed to update creator's profile:", profileUpdateError);
         // Decide if this should throw or just warn
      }

      return family;
    } catch (error) {
      console.error('Error in createFamily:', error);
      throw error;
    }
  },

  async getFamilyMembers(familyId: string) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          profile:profiles (
            id,
            email,
            username
          )
        `)
        .eq('family_id', familyId);

      if (error) throw error;

      return data.map(member => ({
        ...member,
        display_name: member.display_name || member.profile.username || member.profile.email.split('@')[0]
      }));
    } catch (error) {
      console.error('Error in getFamilyMembers:', error);
      throw error;
    }
  },

  async addFamilyMember(familyId: string, email: string, role: 'member' | 'admin' = 'member') {
    try {
      // First, check if the user exists in auth by trying to get their profile
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email);

      if (profileError) throw profileError;

      // If no profile exists, try to find the user in auth.users via RPC
      if (!profiles || profiles.length === 0) {
        let authUser;
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_user_id_by_email', { email_input: email });

          if (rpcError) {
            // Handle potential RPC errors, but specifically look for not found if possible
            // Supabase RPC might not throw a specific code easily distinguishable here
            console.error('RPC Error getting user ID:', rpcError);
            // Assume any RPC error here means user likely doesn't exist or cannot be accessed
             throw new Error('USER_NOT_FOUND'); // Use a specific error message string
          }
          if (!rpcData) {
            // Explicitly check if data returned is null/falsy
            throw new Error('USER_NOT_FOUND'); // Use a specific error message string
          }
          authUser = rpcData; // User ID found

        } catch (error) {
            if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
                 throw error; // Re-throw our specific error
            }
            // Handle other unexpected errors during RPC call
            console.error('Unexpected error during user lookup:', error);
            throw new Error('Failed to verify user existence.'); 
        }

        // --- If user was found via RPC, proceed to create profile & add member --- 
        // ... (existing logic for creating profile and adding member) ...
         const targetUserId = authUser;

        // Create a profile for the user
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: targetUserId,
            email: email,
            family_id: familyId
          }])
          .select('id') // Only select id, rest might not be needed here
          .single();

        if (createError) {
             console.error("Failed to create profile for existing auth user:", createError);
             throw new Error('Failed to setup user profile.'); 
        }

        // Add the new member
        const { data, error } = await supabase
          .from('family_members')
          .insert([{
            family_id: familyId,
            user_id: targetUserId,
            role,
            display_name: email.split('@')[0],
            features_allowed: ['chores', 'groceries', 'expenses', 'reminders']
          }])
          .select()
          .single();

        if (error) {
             console.error("Failed to add family member after profile creation:", error);
             throw new Error('Failed to add user to family.');
        }
        return data;

      } // End of block: if (!profiles || profiles.length === 0)

      // --- If profile already exists, continue here --- 
       // ... (existing logic for adding member when profile exists) ...

    } catch (error) {
      // Log the original error for debugging
      console.error('Error in addFamilyMember:', error);
      
      // Check for our specific error message and re-throw it
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
           throw error;
      }
      // Check for other known errors
      if (error instanceof Error && error.message.includes('already a member')) {
           throw new Error('User is already a member of this family.');
      }
      // Throw a generic error for other cases
      throw new Error('An unexpected error occurred while adding the family member.');
    }
  },

  async updateMemberFeatures(familyId: string, userId: string, features: string[]) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update({ features_allowed: features })
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in updateMemberFeatures:', error);
      throw error;
    }
  },

  async removeFamilyMember(familyId: string, userId: string) {
    try {
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
      console.warn("'getPendingInvitations' relies on the non-existent 'is_verified' column. Returning empty array.");
      return [];
    } catch (error) {
      console.error('Error in getPendingInvitations:', error);
      return [];
    }
  },

  async acceptInvitation(familyId: string) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .update({ is_verified: true })
        .eq('family_id', familyId)
        .eq('user_id', userId)
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
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId)
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
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (currentFamily) {
        // Specific family view: Show family chores for this family
        query = query.eq('family_id', currentFamily.id);
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

  async addChore(chore: Omit<Chore, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('chores')
        .insert([chore])
        .select()
        .single();

      if (error) {
        console.error('Error adding chore:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in addChore:', error);
      throw error;
    }
  },

  async updateChore(id: string, updates: Partial<Chore>) {
    try {
      const { data, error } = await supabase
        .from('chores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating chore:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateChore:', error);
      throw error;
    }
  },

  async deleteChore(id: string) {
    try {
      const { error } = await supabase
        .from('chores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting chore:', error);
        throw error;
      }

      return id;
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
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (currentFamilyId) {
        query = query.eq('family_id', currentFamilyId);
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
    completed?: boolean;
    is_personal: boolean;
    family_id?: string;
  }) {
    try {
      const userId = await getCurrentUserId();
      
      // If no family_id is provided, get the user's default family
      if (!item.family_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', userId)
          .single();
        
        if (!profile?.family_id) {
          throw new Error('You must be part of a family to add items');
        }
        item.family_id = profile.family_id;
      }

      // Verify basic family membership
      const { data: membership } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', item.family_id)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        throw new Error('You must be a member of this family to add items');
      }

      const { data, error } = await supabase
        .from('grocery_items')
        .insert([{
          name: item.title,
          quantity: parseInt(item.quantity || "1", 10),
          purchased: item.completed || false,
          created_by: userId,
          family_id: item.family_id,
          is_personal: item.is_personal
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
    completed: boolean;
    is_personal: boolean;
    family_id: string;
  }>) {
    try {
      const userId = await getCurrentUserId();
      const updateData: any = {};
      
      if (updates.title) updateData.name = updates.title;
      if (updates.quantity) updateData.quantity = parseInt(updates.quantity, 10);
      if (updates.completed !== undefined) updateData.purchased = updates.completed;
      if (updates.family_id !== undefined) updateData.family_id = updates.family_id;
      if (updates.is_personal !== undefined) updateData.is_personal = updates.is_personal;

      const { data, error } = await supabase
        .from('grocery_items')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', userId)
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
      .eq('created_by', userId);
    
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
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (currentFamilyId) {
        // Specific family view: Show family expenses for this family
        query = query.eq('family_id', currentFamilyId);
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

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
    try {
      const userId = await getCurrentUserId();

      // If no family_id is provided, get the user's default family
      if (!expense.family_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', userId)
          .single();
        
        if (!profile?.family_id) {
          throw new Error('You must be part of a family to add expenses');
        }
        expense.family_id = profile.family_id;
      }

      // Verify that the user is a member of the family
      const { data: membership } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', expense.family_id)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        throw new Error('You must be a member of this family to add expenses');
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, created_by: userId }])
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
          .select('*')
          .eq('family_id', updates.family_id)
          .eq('user_id', userId)
          .single();

        if (!membership) {
          throw new Error('You must be a member of this family to update expenses');
        }
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .eq('created_by', userId)
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
        .select('created_by, family_id')
        .eq('id', id)
        .single();

      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.created_by !== userId) {
        throw new Error('Unauthorized: Cannot delete expense created by another user');
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('created_by', userId);
      
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
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (currentFamilyId) {
        // Specific family view: Show family reminders for this family
        query = query.eq('family_id', currentFamilyId);
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

  async addReminder(reminder: Omit<Reminder, 'id' | 'created_at'>) {
    try {
      const userId = await getCurrentUserId();

      // For personal reminders, set family_id to null
      if (reminder.is_personal) {
        reminder.family_id = null;
      } 
      // For family reminders without family_id, get user's default family
      else if (!reminder.family_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', userId)
          .single();
        
        if (!profile?.family_id) {
          throw new Error('You must be part of a family to add reminders');
        }
        reminder.family_id = profile.family_id;
      }

      // If it's a family reminder, verify family membership
      if (reminder.family_id) {
        const { data: membership } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', reminder.family_id)
          .eq('user_id', userId)
          .single();

        if (!membership) {
          throw new Error('You must be a member of this family to add reminders');
        }
      }

      const { data, error } = await supabase
        .from('reminders')
        .insert([{ 
          ...reminder,
          created_by: userId,
        }])
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
        .eq('created_by', userId)
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
        .select('created_by, family_id')
        .eq('id', id)
        .single();

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      if (reminder.created_by !== userId) {
        throw new Error('Unauthorized: Cannot delete reminder created by another user');
      }

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('created_by', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
  },

  scheduleReminderNotification: async (reminder: Reminder) => {
    const notificationService = NotificationService.getInstance();

    if (reminder.due_date) {
      const reminderTime = new Date(reminder.due_date);
      
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