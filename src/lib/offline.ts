import { openDB } from 'idb';

const DB_NAME = 'myhomemanager-offline';
const DB_VERSION = 1;

interface PendingAction {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores for offline data
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id' });
      }
      ['chores', 'groceries', 'expenses', 'reminders'].forEach(table => {
        if (!db.objectStoreNames.contains(table)) {
          db.createObjectStore(table, { keyPath: 'id' });
        }
      });
    },
  });
};

export const saveOfflineAction = async (
  action: 'create' | 'update' | 'delete',
  table: string,
  data: any
) => {
  const db = await initDB();
  const pendingAction: PendingAction = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    table,
    data,
    timestamp: Date.now(),
  };
  await db.add('pendingActions', pendingAction);
};

export const syncOfflineActions = async () => {
  if (!navigator.onLine) return;

  const db = await initDB();
  const pendingActions = await db.getAll('pendingActions');
  
  for (const action of pendingActions) {
    try {
      // Process each pending action
      switch (action.action) {
        case 'create':
          // Handle create action
          break;
        case 'update':
          // Handle update action
          break;
        case 'delete':
          // Handle delete action
          break;
      }
      // Remove processed action
      await db.delete('pendingActions', action.id);
    } catch (error) {
      console.error('Error processing offline action:', error);
    }
  }
};

// Listen for online status changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineActions);
}

export const getOfflineData = async (table: string) => {
  const db = await initDB();
  return db.getAll(table);
};

export const saveOfflineData = async (table: string, data: any) => {
  const db = await initDB();
  await db.put(table, data);
};

export const clearOfflineData = async (table: string) => {
  const db = await initDB();
  await db.clear(table);
}; 