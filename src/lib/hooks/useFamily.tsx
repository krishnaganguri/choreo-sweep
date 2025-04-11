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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for user's family
  const { data: family = null, isLoading } = useQuery({
    queryKey: ['family'],
    queryFn: familyService.getUserFamily,
  });

  // Query for family members if a family exists
  const { data: members = [] } = useQuery({
    queryKey: ['familyMembers', family?.id],
    queryFn: () => family ? familyService.getFamilyMembers(family.id) : Promise.resolve([]),
    enabled: !!family,
  });

  const isAdmin = !!user && !!family && members.some(m => 
    m.user_id === user.id.toString() && m.role === 'admin'
  );

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user || !family) return false;
    const member = members.find(m => m.user_id === user.id.toString());
    if (!member) return false;
    if (member.role === 'admin') return true;
    return member.features_allowed?.includes(feature) || false;
  };

  const refreshFamily = async () => {
    await queryClient.invalidateQueries({ queryKey: ['family'] });
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