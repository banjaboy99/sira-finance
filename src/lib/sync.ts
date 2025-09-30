import { supabase } from '@/integrations/supabase/client';
import { db } from './db';
import { toast } from 'sonner';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
}

class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.setupOnlineListener();
    this.startAutoSync();
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncData();
      toast.success('Back online - syncing data...');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
      toast.info('Working offline - changes will sync when online');
    });
  }

  private startAutoSync() {
    // Sync every 5 minutes when online
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncData();
      }
    }, 5 * 60 * 1000);
  }

  subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback);
    // Immediately notify with current status
    this.getStatus().then(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private async notifyListeners() {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  private async getStatus(): Promise<SyncStatus> {
    const pendingChanges = await db.sync_queue.count();
    const lastSync = localStorage.getItem('lastSyncTime');
    
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: lastSync,
      pendingChanges,
    };
  }

  async syncData() {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping sync');
        return;
      }

      // Pull changes from server first
      await this.pullFromServer(user.id);

      // Then push local changes
      await this.pushToServer(user.id);

      // Update last sync time
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed - will retry later');
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async pullFromServer(userId: string) {
    console.log('Pulling data from server...');

    // Pull inventory
    const { data: inventoryData } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId);

    if (inventoryData) {
      for (const item of inventoryData) {
        await db.inventory.put({
          ...item,
          synced: true,
          deleted: false,
        });
      }
    }

    // Pull expenses
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    if (expensesData) {
      for (const expense of expensesData) {
        await db.expenses.put({
          ...expense,
          synced: true,
          deleted: false,
        });
      }
    }

    // Pull suppliers
    const { data: suppliersData } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId);

    if (suppliersData) {
      for (const supplier of suppliersData) {
        await db.suppliers.put({
          ...supplier,
          synced: true,
          deleted: false,
        });
      }
    }

    // Pull budgets
    const { data: budgetsData } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (budgetsData) {
      for (const budget of budgetsData) {
        await db.budgets.put({
          ...budget,
          synced: true,
          deleted: false,
        });
      }
    }

    // Pull special orders
    const { data: ordersData } = await supabase
      .from('special_orders')
      .select('*')
      .eq('user_id', userId);

    if (ordersData) {
      for (const order of ordersData) {
        await db.special_orders.put({
          ...order,
          synced: true,
          deleted: false,
        });
      }
    }
  }

  private async pushToServer(userId: string) {
    console.log('Pushing local changes to server...');

    const queueItems = await db.sync_queue.orderBy('created_at').toArray();

    for (const item of queueItems) {
      try {
        await this.syncQueueItem(item, userId);
        // Remove from queue after successful sync
        await db.sync_queue.delete(item.id!);
      } catch (error) {
        console.error(`Failed to sync ${item.table_name} ${item.record_id}:`, error);
        // Increment retry count
        await db.sync_queue.update(item.id!, {
          retry_count: item.retry_count + 1,
        });
        
        // Remove from queue if too many retries
        if (item.retry_count >= 5) {
          await db.sync_queue.delete(item.id!);
          console.error(`Removed item from queue after 5 failed attempts:`, item);
        }
      }
    }
  }

  private async syncQueueItem(item: any, userId: string) {
    const tableName = item.table_name;
    const data = { ...item.data, user_id: userId };

    switch (item.operation) {
      case 'create':
        const { error: createError } = await supabase
          .from(tableName)
          .insert(data);
        if (createError) throw createError;
        
        // Mark as synced in local DB
        const localTable = (db as any)[tableName];
        if (localTable) {
          await localTable.update(item.record_id, { synced: true });
        }
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', item.record_id);
        if (updateError) throw updateError;
        
        // Mark as synced in local DB
        const updateTable = (db as any)[tableName];
        if (updateTable) {
          await updateTable.update(item.record_id, { synced: true });
        }
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', item.record_id);
        if (deleteError) throw deleteError;
        
        // Actually delete from local DB now
        const deleteTable = (db as any)[tableName];
        if (deleteTable) {
          await deleteTable.delete(item.record_id);
        }
        break;
    }
  }

  async forceSyncNow() {
    if (this.isOnline) {
      await this.syncData();
      toast.success('Data synced successfully');
    } else {
      toast.error('Cannot sync - you are offline');
    }
  }

  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const syncManager = new SyncManager();
