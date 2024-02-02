import React, { useEffect } from 'react';

import strip from 'strip';
import { gql, useQuery, useMutation } from '@apollo/client';

import { Alert, sendDesktopNotification } from '@erxes/ui/src/utils';
import { IUser } from '@erxes/ui/src/auth/types';

import { mutations, queries, subscriptions } from './graphql';
import {
  INotification,
  MarkAsReadMutationResponse,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse,
} from './types';

interface IStore {
  notifications: INotification[];
  unreadCount: number;
  showNotifications: (requireRead: boolean) => void;
  markAsRead: (notificationIds?: string[]) => void;
  isLoading: boolean;
  currentUser?: IUser;
}

type Props = {
  currentUser: IUser;
  children: React.ReactNode;
};

const NotifContext = React.createContext({} as IStore);

export const NotifConsumer = NotifContext.Consumer;

const Provider = (props: Props) => {
  const { children, currentUser } = props;

  const notificationsQuery = useQuery(gql(queries.notifications), {
    variables: {
      limit: 10,
      requireRead: false,
    },
  });

  const notificationCountQuery = useQuery(gql(queries.notificationCounts), {
    variables: {
      requireRead: true,
    },
  });

  const [notificationsMarkAsReadMutation] = useMutation(
    gql(mutations.markAsRead),
    {
      refetchQueries: () => ['notificationCounts'],
    },
  );

  const notifications = notificationsQuery?.data?.notifications || [];
  const isLoading = notificationsQuery?.loading;
  const unreadCount = notificationCountQuery?.data?.notificationCounts || 0;

  useEffect(() => {
    const unsubscribe = notificationsQuery?.subscribeToMore({
      document: gql(subscriptions.notificationSubscription),
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { notificationInserted } = data;
        const { title, content } = notificationInserted;

        sendDesktopNotification({ title, content: strip(content || '') });

        notificationsQuery?.refetch();
        notificationCountQuery?.refetch();
      },
    });

    const notificationRead = notificationsQuery?.subscribeToMore({
      document: gql(subscriptions.notificationRead),
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: () => {
        notificationsQuery?.refetch();
        notificationCountQuery?.refetch();
      },
    });

    return () => {
      unsubscribe();
      notificationRead();
    };
  }, []);

  const markAsRead = (notificationIds?: string[]) => {
    notificationsMarkAsReadMutation({
      variables: { _ids: notificationIds },
    })
      .then(() => {
        Alert.success('Notifications have been seen');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const showNotifications = (requireRead: boolean) => {
    notificationsQuery?.refetch({ limit: 10, requireRead });
  };

  return (
    <NotifContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotifications: showNotifications,
        markAsRead: markAsRead,
        isLoading,
        currentUser,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
};

export { Provider as NotifProvider };
