import { UNREAD_NOTIFICATIONS_COUNT } from '@/notification/my-inbox/graphql/notificationsQueries';
import {
  NOTIFICATION_READ,
  NOTIFICATION_SUBSCRIPTION,
} from '@/notification/my-inbox/graphql/notificationSubscriptions';
import { refetchNewNotificationsState } from '@/notification/my-inbox/states/notificationState';
import { INotification } from '@/notification/my-inbox/types/notifications';
import { useQuery } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { currentUserState, IUser } from 'ui-modules';

export const useUnreadNotificationCount = () => {
  const currentUser = useAtomValue(currentUserState) as IUser;
  const setRefetchNewNotifications = useSetAtom(refetchNewNotificationsState);
  const { data, loading, subscribeToMore, refetch } = useQuery<{
    unreadNotificationsCount: number;
  }>(UNREAD_NOTIFICATIONS_COUNT);

  const { unreadNotificationsCount = 0 } = data || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      notificationInserted: INotification;
    }>({
      document: NOTIFICATION_SUBSCRIPTION,
      variables: {
        userId: currentUser ? currentUser._id : null,
      },
      updateQuery: () => {
        refetch();
        setRefetchNewNotifications(true);
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
