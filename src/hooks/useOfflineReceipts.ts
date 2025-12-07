import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineReceipts() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const receipts = useLiveQuery(
    () => getRecords(db.receipts, userId),
    [userId]
  );

  // Generate receipt number like RCT-001, RCT-002, etc.
  const generateReceiptNumber = async () => {
    const allReceipts = await db.receipts
      .where('user_id')
      .equals(userId)
      .toArray();
    const count = allReceipts.length + 1;
    return `RCT-${String(count).padStart(3, '0')}`;
  };

  const addReceipt = async (data: {
    invoice_id?: string;
    client_name: string;
    items: any[];
    subtotal: number;
    tax_amount?: number;
    total: number;
    payment_method?: string;
    notes?: string;
  }) => {
    const receipt_number = await generateReceiptNumber();
    return addRecord(db.receipts, {
      ...data,
      receipt_number,
      user_id: userId,
    });
  };

  const updateReceipt = async (id: string, updates: {
    client_name?: string;
    items?: any[];
    subtotal?: number;
    tax_amount?: number;
    total?: number;
    payment_method?: string;
    notes?: string;
  }) => {
    return updateRecord(db.receipts, id, updates);
  };

  const deleteReceipt = async (id: string) => {
    return deleteRecord(db.receipts, id);
  };

  // Get receipt by ID
  const getReceipt = async (id: string) => {
    return db.receipts.get(id);
  };

  return {
    receipts: receipts || [],
    addReceipt,
    updateReceipt,
    deleteReceipt,
    getReceipt,
    generateReceiptNumber,
    isLoading: receipts === undefined,
  };
}
