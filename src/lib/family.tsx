import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Family } from './supabase';
import { familyService } from './services';
import { useToast } from '@/components/ui/use-toast';

interface FamilyContextType {
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
  families: Family[];
  loadFamilies: () => Promise<void>;
  isLoading: boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadFamilies = async () => {
    try {
      setIsLoading(true);
      const data = await familyService.getFamilies();
      setFamilies(data);
      
      // If there's no current family selected but families exist, select the first one
      if (!currentFamily && data.length > 0) {
        setCurrentFamily(data[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load families',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFamilies();
  }, []);

  return (
    <FamilyContext.Provider
      value={{
        currentFamily,
        setCurrentFamily,
        families,
        loadFamilies,
        isLoading,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}; 