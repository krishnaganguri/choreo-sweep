import React, { createContext, useContext, useState, useEffect } from 'react';
import { familyService } from '@/lib/services';
import type { Family, FamilyMember } from '@/lib/types';
import { useAuth } from '@/lib/auth';

interface FamilyWithMembers extends Family {
  members?: (FamilyMember & { user: { email: string } })[];
}

interface FamilyContextType {
  currentFamily: FamilyWithMembers | null;
  setCurrentFamily: (family: Family | null) => void;
  families: Family[];
  refreshFamilies: () => Promise<void>;
  isLoading: boolean;
  isAdmin: (familyId: string) => boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [currentFamily, setCurrentFamily] = useState<FamilyWithMembers | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadFamilyMembers = async (family: Family): Promise<FamilyWithMembers> => {
    try {
      const members = await familyService.getFamilyMembers(family.id);
      return {
        ...family,
        members
      };
    } catch (error) {
      console.error('Error fetching family members:', error);
      return family;
    }
  };

  const refreshFamilies = async () => {
    try {
      const fetchedFamilies = await familyService.getFamilies();
      setFamilies(fetchedFamilies);
      
      // If no current family is selected and we have families, select the first one
      if (!currentFamily && fetchedFamilies.length > 0) {
        const familyWithMembers = await loadFamilyMembers(fetchedFamilies[0]);
        setCurrentFamily(familyWithMembers);
      } else if (currentFamily) {
        // Refresh current family members
        const familyWithMembers = await loadFamilyMembers(currentFamily);
        setCurrentFamily(familyWithMembers);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  };

  // Update current family when it changes
  const handleSetCurrentFamily = async (family: Family | null) => {
    if (family) {
      const familyWithMembers = await loadFamilyMembers(family);
      setCurrentFamily(familyWithMembers);
    } else {
      setCurrentFamily(null);
    }
  };

  const isAdmin = (familyId: string): boolean => {
    if (!user || !currentFamily || currentFamily.id !== familyId) return false;
    const member = currentFamily.members?.find(m => m.user_id === user.id.toString());
    return member?.role === 'admin';
  };

  useEffect(() => {
    const loadFamilies = async () => {
      await refreshFamilies();
      setIsLoading(false);
    };
    loadFamilies();
  }, []);

  return (
    <FamilyContext.Provider
      value={{
        currentFamily,
        setCurrentFamily: handleSetCurrentFamily,
        families,
        refreshFamilies,
        isLoading,
        isAdmin
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