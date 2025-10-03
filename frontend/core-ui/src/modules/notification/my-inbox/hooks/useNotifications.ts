import { NOTIFICATIONS } from '@/notification/my-inbox/graphql/notificationsQueries';
import { NOTIFICATION_SUBSCRIPTION } from '@/notification/my-inbox/graphql/notificationSubscriptions';
import { useNotificationFilters } from '@/notification/my-inbox/hooks/useNotificationFilters';
import { refetchNewNotificationsState } from '@/notification/my-inbox/states/notificationState';
import { INotification } from '@/notification/my-inbox/types/notifications';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { currentUserState } from 'ui-modules';

const NOTIFICATIONS_LIMIT = 24;

export const useNotifications = (
  options?: QueryHookOptions<ICursorListResponse<INotification>>,
) => {
  const filters = useNotificationFilters();
  const currentUser = useAtomValue(currentUserState);
  const [refetchNewNotifications, setRefetchNewNotifications] = useAtom(
    refetchNewNotificationsState,
  );

  const { data, loading, fetchMore, subscribeToMore, refetch } = useQuery<
    ICursorListResponse<INotification>
  >(NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
    ...options,
    variables: {
      limit: NOTIFICATIONS_LIMIT,
      ...filters,
      ...options?.variables,
    },
  });

  const { list = [], pageInfo, totalCount = 0 } = data?.notifications || {};

  const handleFetchMore = () => {
    if (
      validateFetchMore({ direction: EnumCursorDirection.FORWARD, pageInfo })
    ) {
      fetchMore({
        variables: {
          cursor: pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return Object.assign({}, prev, {
            notifications: mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: fetchMoreResult.notifications,
              prevResult: prev.notifications,
            }),
          });
        },
      });
    }
  };

  useEffect(() => {
    if (refetchNewNotifications) {
      if (!loading) {
        refetch();
      }
      setRefetchNewNotifications(false);
    }
  }, [refetchNewNotifications, loading]);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      variables: {
        userId: currentUser ? currentUser._id : null,
      },
    });
    return unsubscribe;
  }, []);

  return {
    notifications: list,
    pageInfo,
    totalCount,
    loading,
    handleFetchMore,
  };
};
