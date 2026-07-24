import React, { useEffect } from 'react';
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
import { relationCustomActivities } from './RelationActivityRow';

type ActivityLogFormRootProps = {
  targetId: string;
  action?: string;
  limit?: number;
  variant?: 'forward' | 'backward';
  customActivities?: ActivityLogCustomActivity[];
  options?: QueryHookOptions<ActivityLogsQueryData>;
  showExactDate?: boolean;
  activityType?: string;
  excludeActivityType?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  onTotalCountChange?: (totalCount: number) => void;
  pageSize?: number;
  paginationMode?: 'infinite' | 'button';
  loadMoreLabel?: React.ReactNode;
  children: React.ReactNode;
};

const ActivityLogsRoot = ({
  targetId,
  action,
  limit,
  variant = 'forward',
  customActivities,
  options,
  showExactDate,
  activityType,
  excludeActivityType,
  dateFrom,
  dateTo,
  onTotalCountChange,
  pageSize,
  paginationMode,
  loadMoreLabel,
  children,
}: ActivityLogFormRootProps) => {
  const {
    activityLogs,
    loading,
    loadingMore,
    error,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    totalCount,
  } = useActivityLogs(
    {
      targetId,
      action,
      limit: pageSize ?? limit,
      variant,
      activityType,
      excludeActivityType,
      dateFrom,
      dateTo,
    },
    options,
  );

  useEffect(() => {
    if (!loading) {
      onTotalCountChange?.(totalCount);
    }
  }, [loading, totalCount, onTotalCountChange]);

  if (loading && activityLogs.length === 0) {
    return <ActivityLogLoading />;
  }

  return (
    <ActivityLogProvider
      targetId={targetId}
      activityLogs={activityLogs}
      loading={loading}
      loadingMore={loadingMore}
      variant={variant}
      error={error}
      customActivities={customActivities}
      handleFetchMore={handleFetchMore}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      totalCount={totalCount}
      limit={limit}
      showExactDate={showExactDate}
      paginationMode={paginationMode}
      loadMoreLabel={loadMoreLabel}
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
  showExactDate?: boolean;
  activityType?: string;
  excludeActivityType?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  onTotalCountChange?: (totalCount: number) => void;
  pageSize?: number;
  paginationMode?: 'infinite' | 'button';
  loadMoreLabel?: React.ReactNode;
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
  showExactDate,
  activityType,
  excludeActivityType,
  dateFrom,
  dateTo,
  onTotalCountChange,
  pageSize,
  paginationMode,
  loadMoreLabel,
}: LegacyProps) => {
  const mergedActivities = [
    ...(showInternalNotes ? [internalNoteCustomActivity] : []),
    ...relationCustomActivities,
    ...(customActivities || []),
  ];

  return (
    <ActivityLogsRoot
      targetId={targetId}
      action={action}
      limit={limit}
      variant={variant}
      customActivities={mergedActivities}
      options={options}
      showExactDate={showExactDate}
      activityType={activityType}
      excludeActivityType={excludeActivityType}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onTotalCountChange={onTotalCountChange}
      pageSize={pageSize}
      paginationMode={paginationMode}
      loadMoreLabel={loadMoreLabel}
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
