import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineInventory() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // Live query that automatically updates when data changes
  const items = useLiveQuery(
    () => getRecords(db.inventory, userId),
    [userId]
  );

  const addItem = async (data: {
    name: string;
    category?: string;
    quantity: number;
    price: number;
    low_stock_threshold?: number;
    notes?: string;
  }) => {
    return addRecord(db.inventory, {
      ...data,
      user_id: userId,
    });
  };

  const updateItem = async (id: string, updates: {
    name?: string;
    category?: string;
    quantity?: number;
    price?: number;
    low_stock_threshold?: number;
    notes?: string;
  }) => {
    return updateRecord(db.inventory, id, updates);
  };

  const deleteItem = async (id: string) => {
    return deleteRecord(db.inventory, id);
  };

  return {
    items: items || [],
    addItem,
    updateItem,
    deleteItem,
    isLoading: items === undefined,
  };
}
