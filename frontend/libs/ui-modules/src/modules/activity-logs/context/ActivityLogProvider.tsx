import React, { createContext, useContext } from 'react';
import { TActivityLog, ActivityLogCustomActivity } from '../types';
import { EnumCursorDirection } from 'erxes-ui';

interface ActivityLogContextType {
  targetId: string;
  activityLogs: TActivityLog[];
  loading: boolean;
  error?: any;
  customActivities?: ActivityLogCustomActivity[];
  handleFetchMore?: (params: { direction: EnumCursorDirection }) => void;
  hasNextPage?: boolean;
  totalCount?: number;
  limit?: number;
}

interface ActivityLogProviderProps {
  children: React.ReactNode;
  targetId: string;
  activityLogs: TActivityLog[];
  loading: boolean;
  error?: any;
  customActivities?: ActivityLogCustomActivity[];
  handleFetchMore?: (params: { direction: EnumCursorDirection }) => void;
  hasNextPage?: boolean;
  totalCount?: number;
  limit?: number;
}

const ActivityLogContext = createContext<ActivityLogContextType | null>(null);

export const ActivityLogProvider: React.FC<ActivityLogProviderProps> = ({
  children,
  targetId,
  activityLogs,
  loading,
  error,
  customActivities,
  handleFetchMore,
  hasNextPage,
  totalCount,
  limit,
}) => {
  return (
    <ActivityLogContext.Provider
      value={{
        targetId,
        activityLogs,
        loading,
        error,
        customActivities,
        handleFetchMore,
        hasNextPage,
        totalCount,
        limit,
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
