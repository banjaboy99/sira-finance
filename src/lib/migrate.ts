import { db } from './db';

/**
 * Migrate data from localStorage to IndexedDB
 * This runs once on app startup
 */
export async function migrateFromLocalStorage(userId: string) {
  const migrationKey = 'indexeddb_migration_complete';
  
  // Check if migration already done
  if (localStorage.getItem(migrationKey) === 'true') {
    console.log('Migration already completed');
    return;
  }

  console.log('Starting migration from localStorage to IndexedDB...');

  try {
    // Migrate business setup data (keep in localStorage for now)
    const setupData = localStorage.getItem('businessSetup');
    if (setupData) {
      // Keep this in localStorage as it's profile data
      console.log('Business setup data found (keeping in localStorage)');
    }

    // Note: Currently the app doesn't have data in localStorage
    // but if it did, we would migrate it here
    
    // Example migration code for inventory items:
    // const inventoryData = localStorage.getItem('inventory');
    // if (inventoryData) {
    //   const items = JSON.parse(inventoryData);
    //   for (const item of items) {
    //     await db.inventory.add({
    //       ...item,
    //       user_id: userId,
    //       synced: false,
    //     });
    //   }
    // }

    // Mark migration as complete
    localStorage.setItem(migrationKey, 'true');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    // Don't mark as complete if there was an error
  }
}

/**
 * Clear all IndexedDB data (for debugging)
 */
export async function clearAllData() {
  await db.inventory.clear();
  await db.expenses.clear();
  await db.suppliers.clear();
  await db.budgets.clear();
  await db.special_orders.clear();
  await db.sync_queue.clear();
  localStorage.removeItem('indexeddb_migration_complete');
  console.log('All data cleared');
}
