import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
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
  variant?: 'forward' | 'backward';
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

const dedupeActivityLogs = (activityLogs: TActivityLog[] = []) => {
  const seen = new Set<string>();

  return activityLogs.filter((activityLog) => {
    if (!activityLog?._id) {
      return true;
    }

    if (seen.has(activityLog._id)) {
      return false;
    }

    seen.add(activityLog._id);
    return true;
  });
};

export const useActivityLogs = (
  {
    targetId,
    action,
    limit,
    targetType,
    variant = 'forward',
  }: UseActivityLogsParams,
  options?: QueryHookOptions<ActivityLogsQueryData>,
) => {
  const { data, loading, error, refetch, subscribeToMore, fetchMore } =
    useQuery<ActivityLogsQueryData>(ACTIVITY_LOGS, {
      ...options,
      fetchPolicy: options?.fetchPolicy ?? 'cache-and-network',
      nextFetchPolicy: options?.nextFetchPolicy ?? 'cache-first',
      variables: {
        targetId,
        targetType,
        action,
        limit,
        variant,
        ...options?.variables,
      },
      skip: !targetId,
    });

  const inFlightCursorRef = useRef<string | null>(null);
  const fetchedCursorsRef = useRef<Set<string>>(new Set());

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
            list:
              variant === 'backward'
                ? [...prev.activityLogs.list, newActivityLog]
                : [newActivityLog, ...prev.activityLogs.list],
            totalCount: prev.activityLogs.totalCount + 1,
          },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [targetId, subscribeToMore, variant]);

  useEffect(() => {
    inFlightCursorRef.current = null;
    fetchedCursorsRef.current.clear();
  }, [targetId, action, limit, targetType, variant]);

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

    const cursor =
      direction === EnumCursorDirection.FORWARD
        ? pageInfo?.endCursor
        : pageInfo?.startCursor;

    if (!cursor) {
      return;
    }

    if (
      inFlightCursorRef.current === cursor ||
      fetchedCursorsRef.current.has(cursor)
    ) {
      return;
    }

    inFlightCursorRef.current = cursor;

    void fetchMore({
      variables: {
        ...options?.variables,
        variant,
        cursor,
        limit: limit || 10,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const mergedActivityLogs = mergeCursorData({
          direction,
          fetchMoreResult: fetchMoreResult.activityLogs,
          prevResult: prev.activityLogs,
        });

        return Object.assign({}, prev, {
          activityLogs: {
            ...mergedActivityLogs,
            list: dedupeActivityLogs(mergedActivityLogs.list),
          },
        });
      },
    })
      .then(() => {
        fetchedCursorsRef.current.add(cursor);
      })
      .catch(() => undefined)
      .finally(() => {
        if (inFlightCursorRef.current === cursor) {
          inFlightCursorRef.current = null;
        }
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
    variant,
  };
};
