import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { sendDesktopNotification } from 'modules/common/utils';
import { INotification } from 'modules/notifications/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import strip from 'strip';
import { queries, subscriptions } from './graphql';
import {
  NotificationsCountQueryResponse,
  NotificationsQueryResponse
} from './types';

interface IStore {
  notifications: INotification[];
  unreadCount: number;
  markAsRead: () => void;
  isLoading: boolean;
}

type Props = {
  notificationsQuery: NotificationsQueryResponse;
  notificationCountQuery: NotificationsCountQueryResponse;
  currentUser: IUser;
};

const NotifContext = React.createContext({} as IStore);

export const NotifConsumer = NotifContext.Consumer;

class Provider extends React.Component<Props> {
  componentWillMount() {
    const {
      notificationsQuery,
      notificationCountQuery,
      currentUser
    } = this.props;

    notificationsQuery.subscribeToMore({
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

  markAsRead() {
    const { notificationsQuery, notificationCountQuery } = this.props;

    notificationsQuery.refetch();
    notificationCountQuery.refetch();
  }

  public render() {
    const { notificationsQuery, notificationCountQuery } = this.props;

    const notifications = notificationsQuery.notifications;
    const isLoading = notificationsQuery.loading;
    const unreadCount = notificationCountQuery.notificationCounts;
    const markAsRead = () => this.markAsRead();

    return (
      <NotifContext.Provider
        value={{ notifications, unreadCount, markAsRead, isLoading }}
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
  )
)(Provider);
