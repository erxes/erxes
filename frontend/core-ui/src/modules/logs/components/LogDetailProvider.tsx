import React, { createContext, useContext } from 'react';
import { useLogDetail } from '@/logs/hooks/useLogDetail';
import { ILogDoc } from '@/logs/types';
import { LogLoading } from '@/logs/components/LogLoading';
import { IconFileX } from '@tabler/icons-react';

interface LogDetailContextType {
  detail: ILogDoc;
  loading: boolean;
  error: any;
}

const LogDetailContext = createContext<LogDetailContextType | null>(null);

export function LogDetailProvider({
  logId,
  children,
}: {
  logId: string;
  children: React.ReactNode;
}) {
  const { detail, loading, error } = useLogDetail(logId);

  if (loading) {
    return <LogLoading message="Loading log details..." />;
  }

  if (!detail) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="size-24 bg-sidebar rounded-xl border border-dashed flex items-center justify-center">
          <IconFileX className="text-accent-foreground size-12" stroke={1.5} />
        </div>
        <div className="text-lg font-medium mt-5 text-foreground">
          No log detail found
        </div>
        <div className="text-muted-foreground mt-2 text-sm text-center max-w-sm">
          The log detail you're looking for doesn't exist or may have been
          removed.
        </div>
      </div>
    );
  }

  return (
    <LogDetailContext.Provider value={{ detail, loading, error }}>
      {children}
    </LogDetailContext.Provider>
  );
}

export function useLogDetailContext() {
  const ctx = useContext(LogDetailContext);
  if (!ctx) {
    throw new Error(
      'useLogDetailContext must be used within LogDetailProvider',
    );
  }
  return ctx;
}
