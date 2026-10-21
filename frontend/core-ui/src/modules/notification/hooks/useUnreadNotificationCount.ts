import { UNREAD_NOTIFICATIONS_COUNT } from '@/notification/graphql/notificationsQueries';
import {
  NOTIFICATION_READ,
  NOTIFICATION_SUBSCRIPTION,
} from '@/notification/graphql/notificationSubscriptions';
import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { currentUserState, IUser, TNotification } from 'ui-modules';

export const useUnreadNotificationCount = () => {
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { data, loading, subscribeToMore, refetch } = useQuery<{
    unreadNotificationsCount: number;
  }>(UNREAD_NOTIFICATIONS_COUNT);

  const { unreadNotificationsCount = 0 } = data || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      notificationInserted: TNotification;
    }>({
      document: NOTIFICATION_SUBSCRIPTION,
      variables: {
        userId: currentUser ? currentUser._id : null,
      },
      updateQuery: () => {
        refetch();
      },
    });

    const notificationRead = subscribeToMore({
      document: NOTIFICATION_READ,
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
      notificationRead();
    };
  }, []);

  return {
    unreadNotificationsCount,
    loading,
  };
};
