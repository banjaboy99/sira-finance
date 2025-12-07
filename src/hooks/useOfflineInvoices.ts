import { useLiveQuery } from 'dexie-react-hooks';
import { db, addRecord, updateRecord, deleteRecord, getRecords, generateId } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

export function useOfflineInvoices() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const invoices = useLiveQuery(
    () => getRecords(db.invoices, userId),
    [userId]
  );

  // Generate invoice number like INV-001, INV-002, etc.
  const generateInvoiceNumber = async () => {
    const allInvoices = await db.invoices
      .where('user_id')
      .equals(userId)
      .toArray();
    const count = allInvoices.length + 1;
    return `INV-${String(count).padStart(3, '0')}`;
  };

  const addInvoice = async (data: {
    client_id?: string;
    client_name: string;
    client_email?: string;
    client_phone?: string;
    client_address?: string;
    items: any[];
    subtotal: number;
    tax_rate?: number;
    tax_amount?: number;
    discount?: number;
    total: number;
    notes?: string;
    due_date?: string;
    status?: string;
  }) => {
    const invoice_number = await generateInvoiceNumber();
    return addRecord(db.invoices, {
      ...data,
      invoice_number,
      user_id: userId,
    });
  };

  const updateInvoice = async (id: string, updates: {
    client_id?: string;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    client_address?: string;
    items?: any[];
    subtotal?: number;
    tax_rate?: number;
    tax_amount?: number;
    discount?: number;
    total?: number;
    notes?: string;
    due_date?: string;
    status?: string;
  }) => {
    return updateRecord(db.invoices, id, updates);
  };

  const deleteInvoice = async (id: string) => {
    return deleteRecord(db.invoices, id);
  };

  // Get invoice by ID
  const getInvoice = async (id: string) => {
    return db.invoices.get(id);
  };

  // Get invoices by status
  const getByStatus = (status: string) => {
    if (!invoices) return [];
    return invoices.filter(inv => inv.status === status);
  };

  return {
    invoices: invoices || [],
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    getByStatus,
    generateInvoiceNumber,
    isLoading: invoices === undefined,
  };
}
