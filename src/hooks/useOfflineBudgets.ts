import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineBudgets() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const budgets = useLiveQuery(
    () => getRecords(db.budgets, userId),
    [userId]
  );

  const addBudget = async (data: {
    category: string;
    amount: number;
    period?: string;
  }) => {
    return addRecord(db.budgets, {
      ...data,
      user_id: userId,
    });
  };

  const updateBudget = async (id: string, updates: {
    category?: string;
    amount?: number;
    period?: string;
  }) => {
    return updateRecord(db.budgets, id, updates);
  };

  const deleteBudget = async (id: string) => {
    return deleteRecord(db.budgets, id);
  };

  return {
    budgets: budgets || [],
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading: budgets === undefined,
  };
}
