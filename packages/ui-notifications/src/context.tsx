import * as compose from 'lodash.flowright';

import { Alert, sendDesktopNotification } from '@erxes/ui/src/utils';
import {
  INotification,
  MarkAsReadMutationResponse,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse
} from './types';
import { mutations, queries, subscriptions } from './graphql';

import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import strip from 'strip';

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
};

type FinalProps = {
  notificationsQuery: NotificationsQueryResponse;
  notificationCountQuery: NotificationsCountQueryResponse;
} & Props &
  MarkAsReadMutationResponse;

const NotifContext = React.createContext({} as IStore);

export const NotifConsumer = NotifContext.Consumer;

class Provider extends React.Component<FinalProps> {
  private unsubscribe;
  private notificationRead;

  componentDidMount() {
    const {
      notificationsQuery,
      notificationCountQuery,
      currentUser
    } = this.props;

    this.unsubscribe = notificationsQuery.subscribeToMore({
      document: gql(subscriptions.notificationSubscription),
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { notificationInserted } = data;
        const { title, content } = notificationInserted;

        sendDesktopNotification({ title, content: strip(content || '') });

        notificationsQuery.refetch();
        notificationCountQuery.refetch();
      }
    });

    this.notificationRead = notificationsQuery.subscribeToMore({
      document: gql(subscriptions.notificationRead),
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: () => {
        notificationsQuery.refetch();
        notificationCountQuery.refetch();
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.notificationRead();
  }

  markAsRead = (notificationIds?: string[]) => {
    const { notificationsMarkAsReadMutation } = this.props;

    notificationsMarkAsReadMutation({
      variables: { _ids: notificationIds }
    })
      .then(() => {
        Alert.success('Notifications have been seen');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  showNotifications = (requireRead: boolean) => {
    const { notificationsQuery } = this.props;

    notificationsQuery.refetch({ limit: 10, requireRead });
  };

  public render() {
    const {
      notificationsQuery,
      notificationCountQuery,
      currentUser
    } = this.props;

    const notifications = notificationsQuery.notifications || [];
    const isLoading = notificationsQuery.loading;
    const unreadCount = notificationCountQuery.notificationCounts || 0;
    return (
      <NotifContext.Provider
        value={{
          notifications,
          unreadCount,
          showNotifications: this.showNotifications,
          markAsRead: this.markAsRead,
          isLoading,
          currentUser
        }}
      >
        {this.props.children}
      </NotifContext.Provider>
    );
  }
}

export const NotifProvider = compose(
  graphql<
    Props,
    NotificationsQueryResponse,
    { limit: number; requireRead: boolean }
  >(gql(queries.notifications), {
    name: 'notificationsQuery',
    options: () => ({
      variables: {
        limit: 10,
        requireRead: false
      }
    })
  }),
  graphql<{}, NotificationsCountQueryResponse>(
    gql(queries.notificationCounts),
    {
      name: 'notificationCountQuery',
      options: () => ({
        variables: {
          requireRead: true
        }
      })
    }
  ),
  graphql<Props, MarkAsReadMutationResponse, { _ids?: string[] }>(
    gql(mutations.markAsRead),
    {
      name: 'notificationsMarkAsReadMutation',
      options: {
        refetchQueries: () => ['notificationCounts']
      }
    }
  )
)(Provider);
