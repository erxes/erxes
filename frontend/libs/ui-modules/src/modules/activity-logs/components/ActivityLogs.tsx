import React from 'react';
import { QueryHookOptions } from '@apollo/client';
import {
  useActivityLogs,
  ActivityLogsQueryData,
} from '../hooks/useActivityLogs';
import { ActivityLogProvider } from '../context/ActivityLogProvider';
import { ActivityLogLoading } from './ActivityLogLoading';
import { ActivityLogList } from './ActivityLogList';
import { ActivityLogCustomActivity } from '../types';
import { ActivityLogRow } from './ActivityLogRow';
import { ActivityLogActorName } from './ActivityLogActor';
import { internalNoteCustomActivity } from '../../internal-notes/components/InternalNoteActivityRow';

type ActivityLogFormRootProps = {
  targetId: string;
  action?: string;
  limit?: number;
  variant?: 'forward' | 'backward';
  customActivities?: ActivityLogCustomActivity[];
  options?: QueryHookOptions<ActivityLogsQueryData>;
  children: React.ReactNode;
};

const ActivityLogsRoot = ({
  targetId,
  action,
  limit,
  variant = 'forward',
  customActivities,
  options,
  children,
}: ActivityLogFormRootProps) => {
  const {
    activityLogs,
    loading,
    error,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    totalCount,
  } = useActivityLogs(
    {
      targetId,
      action,
      limit,
      variant,
    },
    options,
  );

  if (loading) {
    return <ActivityLogLoading />;
  }

  return (
    <ActivityLogProvider
      targetId={targetId}
      activityLogs={activityLogs}
      loading={loading}
      variant={variant}
      error={error}
      customActivities={customActivities}
      handleFetchMore={handleFetchMore}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      totalCount={totalCount}
      limit={limit}
    >
      {children}
    </ActivityLogProvider>
  );
};

const ActivityLogsWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col w-full flex-auto px-6">{children}</div>;
};

const ActivityLogsContent = ({ emptyMessage }: { emptyMessage?: string }) => {
  return (
    <div className="flex flex-col flex-1 w-full p-2">
      <ActivityLogList emptyMessage={emptyMessage} />
    </div>
  );
};

// Legacy props interface for backward compatibility
type LegacyProps = {
  targetId: string;
  action?: string;
  limit?: number;
  variant?: 'forward' | 'backward';
  customActivities?: ActivityLogCustomActivity[];
  showInternalNotes?: boolean;
  emptyMessage?: string;
  options?: QueryHookOptions<ActivityLogsQueryData>;
};

// Legacy component wrapper
const ActivityLogsLegacy = ({
  targetId,
  action,
  limit,
  variant = 'forward',
  customActivities,
  showInternalNotes = true,
  emptyMessage,
  options,
}: LegacyProps) => {
  const mergedActivities = showInternalNotes
    ? [internalNoteCustomActivity, ...(customActivities || [])]
    : customActivities;

  return (
    <ActivityLogsRoot
      targetId={targetId}
      action={action}
      limit={limit}
      variant={variant}
      customActivities={mergedActivities}
      options={options}
    >
      <ActivityLogsWrapper>
        <ActivityLogsContent emptyMessage={emptyMessage} />
      </ActivityLogsWrapper>
    </ActivityLogsRoot>
  );
};

export const ActivityLogs = Object.assign(ActivityLogsLegacy, {
  Root: ActivityLogsRoot,
  Wrapper: ActivityLogsWrapper,
  Content: ActivityLogsContent,
  List: ActivityLogList,
  Row: ActivityLogRow,
  ActorName: ActivityLogActorName,
});
