import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineSpecialOrders() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const orders = useLiveQuery(
    () => getRecords(db.special_orders, userId),
    [userId]
  );

  const addOrder = async (data: {
    customer_name: string;
    item_description: string;
    status?: string;
    delivery_date?: string;
    notes?: string;
  }) => {
    return addRecord(db.special_orders, {
      ...data,
      user_id: userId,
    });
  };

  const updateOrder = async (id: string, updates: {
    customer_name?: string;
    item_description?: string;
    status?: string;
    delivery_date?: string;
    notes?: string;
  }) => {
    return updateRecord(db.special_orders, id, updates);
  };

  const deleteOrder = async (id: string) => {
    return deleteRecord(db.special_orders, id);
  };

  return {
    orders: orders || [],
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading: orders === undefined,
  };
}
