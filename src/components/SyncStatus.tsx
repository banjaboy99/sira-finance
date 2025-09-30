import { useEffect, useState } from 'react';
import { syncManager, SyncStatus as SyncStatusType } from '@/lib/sync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SyncStatus = () => {
  const [status, setStatus] = useState<SyncStatusType>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
  });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const handleSync = () => {
    syncManager.forceSyncNow();
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={status.isOnline ? "default" : "secondary"}
        className={cn(
          "gap-1.5",
          status.isOnline && "bg-success text-success-foreground"
        )}
      >
        {status.isOnline ? (
          <>
            <Cloud className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <CloudOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {status.pendingChanges > 0 && (
        <Badge variant="outline" className="gap-1.5">
          {status.pendingChanges} pending
        </Badge>
      )}

      {status.isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={status.isSyncing}
          className="h-8 gap-2"
        >
          {status.isSyncing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              {formatLastSync(status.lastSyncTime)}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
