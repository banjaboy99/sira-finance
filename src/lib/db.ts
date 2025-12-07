import Dexie, { Table } from 'dexie';

// Database interfaces
export interface InventoryItem {
  id?: string;
  user_id: string;
  name: string;
  category?: string;
  quantity: number;
  price: number;
  low_stock_threshold?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface Expense {
  id?: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  budget_id?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface Supplier {
  id?: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface Budget {
  id?: string;
  user_id: string;
  category: string;
  amount: number;
  period?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface SpecialOrder {
  id?: string;
  user_id: string;
  customer_name: string;
  item_description: string;
  status?: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface Client {
  id?: string;
  user_id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface Invoice {
  id?: string;
  user_id: string;
  invoice_number: string;
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
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface Receipt {
  id?: string;
  user_id: string;
  receipt_number: string;
  invoice_id?: string;
  client_name: string;
  items: any[];
  subtotal: number;
  tax_amount?: number;
  total: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

export interface SyncQueue {
  id?: number;
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  created_at: string;
  retry_count: number;
}

// Database class
class PocketStockDB extends Dexie {
  inventory!: Table<InventoryItem>;
  expenses!: Table<Expense>;
  suppliers!: Table<Supplier>;
  budgets!: Table<Budget>;
  special_orders!: Table<SpecialOrder>;
  clients!: Table<Client>;
  invoices!: Table<Invoice>;
  receipts!: Table<Receipt>;
  sync_queue!: Table<SyncQueue>;

  constructor() {
    super('PocketStockDB');
    
    this.version(2).stores({
      inventory: 'id, user_id, name, category, synced, deleted',
      expenses: 'id, user_id, category, date, synced, deleted',
      suppliers: 'id, user_id, name, synced, deleted',
      budgets: 'id, user_id, category, synced, deleted',
      special_orders: 'id, user_id, customer_name, status, synced, deleted',
      clients: 'id, user_id, name, synced, deleted',
      invoices: 'id, user_id, invoice_number, client_id, status, synced, deleted',
      receipts: 'id, user_id, receipt_number, invoice_id, synced, deleted',
      sync_queue: '++id, table_name, record_id, operation, created_at',
    });
  }
}

export const db = new PocketStockDB();

// Helper functions for CRUD operations
export const generateId = () => crypto.randomUUID();

export const getCurrentTimestamp = () => new Date().toISOString();

// Generic CRUD helpers
export async function addRecord<T extends { id?: string; synced: boolean }>(
  table: Table<T>,
  data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'synced'>
): Promise<string> {
  const id = generateId();
  const timestamp = getCurrentTimestamp();
  
  const record = {
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
    synced: false,
  };
  
  await table.add(record as unknown as T);
  
  // Add to sync queue
  await db.sync_queue.add({
    table_name: table.name,
    record_id: id,
    operation: 'create',
    data: record,
    created_at: timestamp,
    retry_count: 0,
  });
  
  return id;
}

export async function updateRecord<T extends { id?: string; synced: boolean }>(
  table: Table<T>,
  id: string,
  updates: Partial<T>
): Promise<void> {
  const timestamp = getCurrentTimestamp();
  
  await table.update(id, {
    ...updates,
    updated_at: timestamp,
    synced: false,
  } as any);
  
  // Add to sync queue
  const record = await table.get(id);
  if (record) {
    await db.sync_queue.add({
      table_name: table.name,
      record_id: id,
      operation: 'update',
      data: record,
      created_at: timestamp,
      retry_count: 0,
    });
  }
}

export async function deleteRecord<T extends { id?: string; synced: boolean; deleted?: boolean }>(
  table: Table<T>,
  id: string
): Promise<void> {
  const timestamp = getCurrentTimestamp();
  
  // Soft delete - mark as deleted but keep for sync
  await table.update(id, {
    deleted: true,
    updated_at: timestamp,
    synced: false,
  } as any);
  
  // Add to sync queue
  await db.sync_queue.add({
    table_name: table.name,
    record_id: id,
    operation: 'delete',
    data: { id },
    created_at: timestamp,
    retry_count: 0,
  });
}

export async function getRecords<T extends { deleted?: boolean }>(
  table: Table<T>,
  userId: string
): Promise<T[]> {
  return table
    .where('user_id')
    .equals(userId)
    .and(item => !item.deleted)
    .toArray();
}
