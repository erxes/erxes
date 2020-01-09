import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { Alert, sendDesktopNotification } from 'modules/common/utils';
import {
  INotification,
  MarkAsReadMutationResponse
} from 'modules/notifications/types';
import React from 'react';
import { graphql } from 'react-apollo';
import strip from 'strip';
import { mutations, queries, subscriptions } from './graphql';
import {
  NotificationsCountQueryResponse,
  NotificationsQueryResponse
} from './types';

interface IStore {
  notifications: INotification[];
  unreadCount: number;
  showNotifications: (requireRead: boolean) => void;
  markAsRead: (notificationIds?: string[]) => void;
  isLoading: boolean;
}

type Props = {
  notificationsQuery: NotificationsQueryResponse;
  notificationCountQuery: NotificationsCountQueryResponse;
  currentUser: IUser;
} & MarkAsReadMutationResponse;

const NotifContext = React.createContext({} as IStore);

export const NotifConsumer = NotifContext.Consumer;

class Provider extends React.Component<Props> {
  private unsubscribe;

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
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  markAsRead = (notificationIds?: string[]) => {
    const {
      notificationsMarkAsReadMutation,
      notificationsQuery,
      notificationCountQuery
    } = this.props;

    notificationsMarkAsReadMutation({
      variables: { _ids: notificationIds }
    })
      .then(() => {
        notificationsQuery.refetch();
        notificationCountQuery.refetch();

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
    const { notificationsQuery, notificationCountQuery } = this.props;

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
          isLoading
        }}
      >
        {this.props.children}
      </NotifContext.Provider>
    );
  }
}

export const NotifProvider = compose(
  graphql<
    {},
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
