import React, { createContext, useContext } from 'react';
import { useLogDetail } from '@/logs/hooks/useLogDetail';
import { ILogDoc } from '@/logs/types';
import { LogLoading } from '@/logs/components/LogLoading';
import { IconFileX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface LogDetailProviderProps {
  readonly logId: string;
  readonly children: React.ReactNode;
}

interface LogDetailContextType {
  detail: ILogDoc;
  loading: boolean;
  error: any;
}

const LogDetailContext = createContext<LogDetailContextType | null>(null);

export function LogDetailProvider({ logId, children }: LogDetailProviderProps) {
  const { detail, loading, error } = useLogDetail(logId);
  const { t } = useTranslation('common', { keyPrefix: 'logs' });

  if (loading) {
    return <LogLoading message={t('loading-log-details')} />;
  }

  if (!detail) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="size-24 bg-sidebar rounded-xl border border-dashed flex items-center justify-center">
          <IconFileX className="text-accent-foreground size-12" stroke={1.5} />
        </div>
        <div className="text-lg font-medium mt-5 text-foreground">
          {t('no-log-detail')}
        </div>
        <div className="text-muted-foreground mt-2 text-sm text-center max-w-sm">
          {t('log-detail-missing')}
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
