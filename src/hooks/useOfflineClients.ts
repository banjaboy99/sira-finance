import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineClients() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const clients = useLiveQuery(
    () => getRecords(db.clients, userId),
    [userId]
  );

  const addClient = async (data: {
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return addRecord(db.clients, {
      ...data,
      user_id: userId,
    });
  };

  const updateClient = async (id: string, updates: {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return updateRecord(db.clients, id, updates);
  };

  const deleteClient = async (id: string) => {
    return deleteRecord(db.clients, id);
  };

  return {
    clients: clients || [],
    addClient,
    updateClient,
    deleteClient,
    isLoading: clients === undefined,
  };
}
