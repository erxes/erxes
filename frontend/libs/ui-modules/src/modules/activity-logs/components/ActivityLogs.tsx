import React, { Children, isValidElement } from 'react';
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

function hasActivityLogHeader(children: React.ReactNode): boolean {
  let found = false;

  Children.forEach(children, (child) => {
    if (found) return;

    if (isValidElement(child)) {
      if (
        child.type === ActivityLogsHeader ||
        (child.type as any)?.displayName === 'ActivityLogsHeader'
      ) {
        found = true;
        return;
      }

      if (child.props?.children) {
        found = hasActivityLogHeader(child.props.children);
      }
    }
  });

  return found;
}

type ActivityLogFormRootProps = {
  targetId: string;
  action?: string;
  limit?: number;
  customActivities?: ActivityLogCustomActivity[];
  options?: QueryHookOptions<ActivityLogsQueryData>;
  children: React.ReactNode;
};

const ActivityLogsRoot = ({
  targetId,
  action,
  limit,
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
    totalCount,
  } = useActivityLogs(
    {
      targetId,
      action,
      limit,
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
      error={error}
      customActivities={customActivities}
      handleFetchMore={handleFetchMore}
      hasNextPage={hasNextPage}
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

const ActivityLogsHeader = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="w-full p-2">
      {children || <h4 className="text-sm font-medium">Activity</h4>}
    </div>
  );
};

ActivityLogsHeader.displayName = 'ActivityLogsHeader';

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
      customActivities={mergedActivities}
      options={options}
    >
      <ActivityLogsWrapper>
        <ActivityLogsHeader />
        <ActivityLogsContent emptyMessage={emptyMessage} />
      </ActivityLogsWrapper>
    </ActivityLogsRoot>
  );
};

export const ActivityLogs = Object.assign(ActivityLogsLegacy, {
  Root: ActivityLogsRoot,
  Wrapper: ActivityLogsWrapper,
  Header: ActivityLogsHeader,
  Content: ActivityLogsContent,
  List: ActivityLogList,
  Row: ActivityLogRow,
  ActorName: ActivityLogActorName,
});
