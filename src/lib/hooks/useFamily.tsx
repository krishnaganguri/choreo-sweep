import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { familyService } from '@/lib/services';
import { useAuth } from './useAuth';
import type { Family, FamilyMember } from '@/lib/types';

interface FamilyContextType {
  family: Family | null;
  isLoading: boolean;
  isAdmin: boolean;
  hasFeatureAccess: (feature: string) => boolean;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for user's family - depends on user ID
  const { data: family = null, isLoading: isFamilyLoading } = useQuery({
    queryKey: ['family', user?.id],
    queryFn: familyService.getUserFamily,
    enabled: !!user,
  });

  // Query for family members if a family exists
  const { data: members = [], isLoading: areMembersLoading } = useQuery({
    queryKey: ['familyMembers', family?.id],
    queryFn: () => family?.id ? familyService.getFamilyMembers(family.id) : Promise.resolve([]),
    enabled: !!family?.id && !isFamilyLoading,
  });

  // Combine loading states
  const isLoading = isAuthLoading || isFamilyLoading || (!!family && areMembersLoading);

  // isAdmin should also check if members are still loading
  const isAdmin = !isLoading && !!user && !!family && members.some(m => 
    m.user_id === user.id.toString() && m.role === 'admin'
  );

  const hasFeatureAccess = (feature: string): boolean => {
    if (isLoading || !user || !family) return false;
    const member = members.find(m => m.user_id === user.id.toString());
    if (!member) return false;
    if (member.role === 'admin') return true;
    return member.features_allowed?.includes(feature) || false;
  };

  const refreshFamily = async () => {
    await queryClient.invalidateQueries({ queryKey: ['family', user?.id] });
    if (family?.id) {
      await queryClient.invalidateQueries({ queryKey: ['familyMembers', family.id] });
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        family,
        isLoading,
        isAdmin,
        hasFeatureAccess,
        refreshFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
} 