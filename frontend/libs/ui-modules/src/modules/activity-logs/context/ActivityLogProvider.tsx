import React, { createContext, useContext } from 'react';
import { TActivityLog, ActivityLogCustomActivity } from '../types';
import { EnumCursorDirection } from 'erxes-ui';

interface ActivityLogContextType {
  targetId: string;
  activityLogs: TActivityLog[];
  loading: boolean;
  loadingMore?: boolean;
  variant?: 'forward' | 'backward';
  error?: Error;
  customActivities?: ActivityLogCustomActivity[];
  handleFetchMore?: (params: { direction: EnumCursorDirection }) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalCount?: number;
  limit?: number;
  showExactDate?: boolean;
  paginationMode?: 'infinite' | 'button';
  loadMoreLabel?: React.ReactNode;
}

interface ActivityLogProviderProps {
  children: React.ReactNode;
  targetId: string;
  activityLogs: TActivityLog[];
  loading: boolean;
  loadingMore?: boolean;
  variant?: 'forward' | 'backward';
  error?: Error;
  customActivities?: ActivityLogCustomActivity[];
  handleFetchMore?: (params: { direction: EnumCursorDirection }) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalCount?: number;
  limit?: number;
  showExactDate?: boolean;
  paginationMode?: 'infinite' | 'button';
  loadMoreLabel?: React.ReactNode;
}

const ActivityLogContext = createContext<ActivityLogContextType | null>(null);

export const ActivityLogProvider: React.FC<ActivityLogProviderProps> = ({
  children,
  targetId,
  activityLogs,
  loading,
  loadingMore,
  variant = 'forward',
  error,
  customActivities,
  handleFetchMore,
  hasNextPage,
  hasPreviousPage,
  totalCount,
  limit,
  showExactDate,
  paginationMode,
  loadMoreLabel,
}) => {
  return (
    <ActivityLogContext.Provider
      value={{
        targetId,
        activityLogs,
        loading,
        loadingMore,
        variant,
        error,
        customActivities,
        handleFetchMore,
        hasNextPage,
        hasPreviousPage,
        totalCount,
        limit,
        showExactDate,
        paginationMode,
        loadMoreLabel,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const ctx = useContext(ActivityLogContext);
  if (!ctx)
    throw new Error('useActivityLog must be used within ActivityLogProvider');
  return ctx;
};
