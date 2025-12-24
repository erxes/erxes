import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ACTIVITY_LOGS } from '../graphql/queries';
import { TActivityLog } from '../types';
import { ACTIVITY_LOG_INSERTED } from '../graphql/subscriptions';
import {
  EnumCursorDirection,
  validateFetchMore,
  mergeCursorData,
} from 'erxes-ui';

interface UseActivityLogsParams {
  targetId: string;
  action?: string;
  limit?: number;
  targetType?: string;
  contextType?: string;
  contextId?: string;
}

export type ActivityLogsQueryData = {
  activityLogs: {
    list: TActivityLog[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
};

export const useActivityLogs = (
  { targetId, action, limit, targetType }: UseActivityLogsParams,
  options?: QueryHookOptions<ActivityLogsQueryData>,
) => {
  const { data, loading, error, refetch, subscribeToMore, fetchMore } =
    useQuery<ActivityLogsQueryData>(ACTIVITY_LOGS, {
      ...options,
      variables: {
        targetId,
        targetType,
        action,
        limit,
        ...options?.variables,
      },
      skip: !targetId,
    });

  useEffect(() => {
    if (!targetId) {
      return;
    }

    const unsubscribe = subscribeToMore<{
      activityLogInserted: TActivityLog;
    }>({
      document: ACTIVITY_LOG_INSERTED,
      variables: {
        targetId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.activityLogInserted) {
          return prev;
        }

        const newActivityLog = subscriptionData.data.activityLogInserted;

        // Check if the activity log already exists in the list
        const exists = prev?.activityLogs?.list?.some(
          (log) => log._id === newActivityLog._id,
        );

        if (exists || !prev?.activityLogs) {
          return prev;
        }

        // Add the new activity log to the beginning of the list
        return {
          ...prev,
          activityLogs: {
            ...prev.activityLogs,
            list: [newActivityLog, ...prev.activityLogs.list],
            totalCount: prev.activityLogs.totalCount + 1,
          },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [targetId, subscribeToMore]);

  const pageInfo = data?.activityLogs.pageInfo || {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  };

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        ...options?.variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: limit || 10,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          activityLogs: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.activityLogs,
            prevResult: prev.activityLogs,
          }),
        });
      },
    });
  };

  return {
    activityLogs: data?.activityLogs.list || [],
    totalCount: data?.activityLogs.totalCount || 0,
    pageInfo,
    loading,
    error,
    refetch,
    handleFetchMore,
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage: pageInfo.hasPreviousPage,
  };
};
