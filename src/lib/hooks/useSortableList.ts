import { useState, useCallback } from 'react';

type SortOrder = 'asc' | 'desc';

interface SortConfig<T extends string> {
  sortBy: T;
  sortOrder: SortOrder;
}

export function useSortableList<T extends string>(
  initialSortBy: T,
  initialSortOrder: SortOrder = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  });

  const handleSort = useCallback((type: T) => {
    setSortConfig((prevConfig) => ({
      sortBy: type,
      sortOrder:
        prevConfig.sortBy === type
          ? prevConfig.sortOrder === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc',
    }));
  }, []);

  const getSortedItems = useCallback(<Item extends Record<string, any>>(
    items: Item[],
    completedField?: keyof Item,
    customSortLogic?: (a: Item, b: Item, sortBy: T, sortOrder: SortOrder) => number
  ) => {
    return [...items].sort((a, b) => {
      // Handle completed items if completedField is provided
      if (completedField) {
        if (a[completedField] && !b[completedField]) return 1;
        if (!a[completedField] && b[completedField]) return -1;
      }

      // Use custom sort logic if provided
      if (customSortLogic) {
        return customSortLogic(a, b, sortConfig.sortBy, sortConfig.sortOrder);
      }

      // Default sorting logic
      const aValue = a[sortConfig.sortBy];
      const bValue = b[sortConfig.sortBy];

      // Handle undefined or null values
      if (aValue === undefined || aValue === null) return sortConfig.sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined || bValue === null) return sortConfig.sortOrder === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Check if values are dates by attempting to convert to timestamps
      const aTime = new Date(aValue).getTime();
      const bTime = new Date(bValue).getTime();
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return sortConfig.sortOrder === 'asc'
          ? aTime - bTime
          : bTime - aTime;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [sortConfig]);

  return {
    sortConfig,
    handleSort,
    getSortedItems,
  };
} 