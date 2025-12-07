import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineExpenses() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const expenses = useLiveQuery(
    () => getRecords(db.expenses, userId),
    [userId]
  );

  const addExpense = async (data: {
    amount: number;
    category: string;
    description?: string;
    date: string;
    budget_id?: string;
  }) => {
    return addRecord(db.expenses, {
      ...data,
      user_id: userId,
    });
  };

  const updateExpense = async (id: string, updates: {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
    budget_id?: string;
  }) => {
    return updateRecord(db.expenses, id, updates);
  };

  const deleteExpense = async (id: string) => {
    return deleteRecord(db.expenses, id);
  };

  // Helper to get total expenses for a date range
  const getTotalForDateRange = (startDate: string, endDate: string) => {
    if (!expenses) return 0;
    return expenses
      .filter(e => e.date >= startDate && e.date <= endDate)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  };

  // Get expenses by category
  const getByCategory = (category: string) => {
    if (!expenses) return [];
    return expenses.filter(e => e.category === category);
  };

  return {
    expenses: expenses || [],
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalForDateRange,
    getByCategory,
    isLoading: expenses === undefined,
  };
}
