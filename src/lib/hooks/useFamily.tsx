import React, { createContext, useContext, useState } from 'react';
import { familyService } from '@/lib/services';
import type { Family, FamilyMember } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

interface FamilyWithMembers extends Family {
  members?: (FamilyMember & { user: { email: string } })[];
}

interface FamilyContextType {
  currentFamily: FamilyWithMembers | null | undefined;
  setCurrentFamily: (family: Family | null | undefined) => void;
  families: Family[];
  isLoading: boolean;
  isAdmin: (familyId: string) => boolean;
  refreshFamilies: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [currentFamily, setCurrentFamily] = useState<FamilyWithMembers | null | undefined>(undefined);
  const { user } = useAuth();

  // Query for families
  const { data: families = [], isLoading, refetch: refreshFamilies } = useQuery({
    queryKey: ['families'],
    queryFn: familyService.getFamilies,
    onSuccess: (fetchedFamilies) => {
      if (fetchedFamilies.length === 0) {
        setCurrentFamily(null);
      } else if (!currentFamily && fetchedFamilies.length > 0) {
        setCurrentFamily(fetchedFamilies[0]);
      } else if (currentFamily) {
        const familyStillExists = fetchedFamilies.some(f => f.id === currentFamily.id);
        if (!familyStillExists) {
          setCurrentFamily(fetchedFamilies.length > 0 ? fetchedFamilies[0] : null);
        }
      }
    }
  });

  // Query for current family members if a family is selected
  const { data: currentFamilyMembers } = useQuery({
    queryKey: ['familyMembers', currentFamily?.id],
    queryFn: () => currentFamily ? familyService.getFamilyMembers(currentFamily.id) : Promise.resolve([]),
    enabled: !!currentFamily,
  });

  // Update current family with members when they change
  React.useEffect(() => {
    if (currentFamily && currentFamilyMembers) {
      setCurrentFamily({
        ...currentFamily,
        members: currentFamilyMembers
      });
    }
  }, [currentFamilyMembers, currentFamily]);

  const isAdmin = (familyId: string): boolean => {
    if (!user || !currentFamily || currentFamily.id !== familyId) return false;
    const member = currentFamily.members?.find(m => m.user_id === user.id.toString());
    return member?.role === 'admin';
  };

  return (
    <FamilyContext.Provider
      value={{
        currentFamily,
        setCurrentFamily,
        families,
        isLoading,
        isAdmin,
        refreshFamilies
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}; 