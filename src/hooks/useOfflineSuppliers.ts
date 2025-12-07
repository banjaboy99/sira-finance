import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineSuppliers() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const suppliers = useLiveQuery(
    () => getRecords(db.suppliers, userId),
    [userId]
  );

  const addSupplier = async (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return addRecord(db.suppliers, {
      ...data,
      user_id: userId,
    });
  };

  const updateSupplier = async (id: string, updates: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return updateRecord(db.suppliers, id, updates);
  };

  const deleteSupplier = async (id: string) => {
    return deleteRecord(db.suppliers, id);
  };

  return {
    suppliers: suppliers || [],
    addSupplier,
    updateSupplier,
    deleteSupplier,
    isLoading: suppliers === undefined,
  };
}
