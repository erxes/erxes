import { NOTIFICATIONS } from '@/notification/graphql/notificationsQueries';
import {
  NOTIFICATION_SUBSCRIPTION,
  NOTIFICATION_READ,
} from '@/notification/graphql/notificationSubscriptions';
import { useNotificationFilters } from '@/notification/hooks/useNotificationFilters';
import {
  type ApolloError,
  type QueryHookOptions,
  useQuery,
  useSubscription,
} from '@apollo/client';
import {
  EnumCursorDirection,
  type ICursorListResponse,
  validateFetchMore,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { currentUserState, type TNotification } from 'ui-modules';

type NotificationPage = ICursorListResponse<TNotification>['notifications'];
interface NotificationsResult {
  notifications: TNotification[];
  pageInfo: NotificationPage['pageInfo'] | undefined;
  totalCount: number;
  loading: boolean;
  error: ApolloError | undefined;
  fetchMoreError: string | null;
  fetchingMore: boolean;
  handleFetchMore: (retry?: boolean) => Promise<void>;
  retry: () => Promise<void>;
}

export const useNotifications = (
  options?: QueryHookOptions<ICursorListResponse<TNotification>>,
): NotificationsResult => {
  const filters = useNotificationFilters();
  const currentUser = useAtomValue(currentUserState);
  const filterKey = JSON.stringify({ ...filters, ...options?.variables });
  const scopeRef = useRef({ active: false, fetching: false });
  const [fetchingMore, setFetchingMore] = useState(false);
  const [fetchMoreError, setFetchMoreError] = useState<string | null>(null);
  const { data, loading, error, fetchMore, refetch } = useQuery<
    ICursorListResponse<TNotification>
  >(NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
    ...options,
    variables: { limit: 24, ...filters, ...options?.variables },
  });
  useLayoutEffect(() => {
    const scope = { active: true, fetching: false };
    scopeRef.current = scope;
    setFetchMoreError(null);
    setFetchingMore(false);
    return () => {
      scope.active = false;
    };
  }, [filterKey]);
  const { list = [], pageInfo, totalCount = 0 } = data?.notifications || {};
  const retry = useCallback(async (): Promise<void> => {
    try {
      await refetch();
    } catch {
      /* The query's error state renders the failure. */
    }
  }, [refetch]);
  const subscriptionOptions = {
    variables: { userId: currentUser?._id },
    skip: !currentUser?._id,
    onData: () => {
      void retry();
    },
  };
  useSubscription(NOTIFICATION_SUBSCRIPTION, subscriptionOptions);
  useSubscription(NOTIFICATION_READ, subscriptionOptions);

  const handleFetchMore = async (retryFailed = false): Promise<void> => {
    const scope = scopeRef.current;
    if (
      !scope.active ||
      scope.fetching ||
      loading ||
      (fetchMoreError && !retryFailed) ||
      !validateFetchMore({ direction: EnumCursorDirection.FORWARD, pageInfo })
    )
      return;
    scope.fetching = true;
    setFetchingMore(true);
    setFetchMoreError(null);
    try {
      await fetchMore({
        variables: { cursor: pageInfo?.endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || !scope.active) return prev;
          const page = fetchMoreResult.notifications;
          if (
            page.pageInfo.hasNextPage &&
            page.pageInfo.endCursor === prev.notifications.pageInfo.endCursor
          ) {
            throw new Error(
              'Notification pagination did not advance. Please retry.',
            );
          }
          const items = new Map(
            [...prev.notifications.list, ...page.list].map((item) => [
              item._id,
              item,
            ]),
          );
          return {
            ...prev,
            notifications: {
              ...page,
              list: [...items.values()],
              pageInfo: {
                ...page.pageInfo,
                startCursor: prev.notifications.pageInfo.startCursor,
              },
            },
          };
        },
      });
    } catch (error_) {
      if (scope.active)
        setFetchMoreError(
          error_ instanceof Error
            ? error_.message
            : 'Unable to load more notifications',
        );
    } finally {
      scope.fetching = false;
      if (scope.active) setFetchingMore(false);
    }
  };
  return {
    notifications: list,
    pageInfo,
    totalCount,
    loading: loading && !data,
    error,
    fetchMoreError,
    fetchingMore,
    handleFetchMore,
    retry,
  };
};
