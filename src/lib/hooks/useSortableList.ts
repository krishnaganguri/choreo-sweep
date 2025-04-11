import { useState } from 'react';

export interface SortConfig<T extends string> {
  key: T;
  direction: 'asc' | 'desc';
}

export function useSortableList<T extends string>(defaultKey: T) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: defaultKey,
    direction: 'asc',
  });

  const handleSort = (key: T) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortedItems = <TItem>(
    items: TItem[],
    defaultSortKey?: T,
    compareFn?: (a: TItem, b: TItem, sortBy: T, sortOrder: 'asc' | 'desc') => number
  ) => {
    const sortKey = defaultSortKey || sortConfig.key;
    const sortOrder = sortConfig.direction;

    return [...items].sort((a, b) => {
      if (compareFn) {
        return compareFn(a, b, sortKey, sortOrder);
      }

      // Default comparison for objects with sortKey as property
      const aValue = (a as any)[sortKey];
      const bValue = (b as any)[sortKey];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return { sortConfig, handleSort, getSortedItems };
} 