import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { mutations } from '../../user/graphql';
import Notifications from '../components/notifications/List';
import {
  IUser,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse,
} from '../../types';

type Props = {
  count: number;
  currentUser: IUser;
};

const notificationsQuery = gql`
  query ClientPortalNotifications(
    $endDate: String
    $limit: Int
    $notifType: NotificationType
    $page: Int
    $perPage: Int
    $requireRead: Boolean
    $search: String
    $startDate: String
  ) {
    clientPortalNotifications(
      endDate: $endDate
      limit: $limit
      notifType: $notifType
      page: $page
      perPage: $perPage
      requireRead: $requireRead
      search: $search
      startDate: $startDate
    ) {
      _id
      content
      createdAt
      isRead
      link
      notifType
      title
    }
  }
`;

function NotificationsContainer(props: Props) {
  //   const notificationsCountResponse = useQuery<NotificationsCountQueryResponse>(noficationsCountQuery, {
  //     skip: !props.currentUser,
  //   });

  const markAsRead = (notificationIds?: string[]) => {
    console.log('markAsRead', notificationIds);
  }

  const notificationsResponse = useQuery<NotificationsQueryResponse>(
    notificationsQuery,
    {
      skip: !props.currentUser,
    }
  );

  //   if (notificationsCountResponse.error) {
  //     return <div>{notificationsCountResponse.error.message}</div>;
  //   }

  //   const notificationsCount =
  //     (notificationsCountResponse.data &&
  //       notificationsCountResponse.data.clientPortalNotificationCounts) ||
  //     0;

  const notifications =
    (notificationsResponse.data &&
      notificationsResponse.data.clientPortalNotifications) ||
    [];

  //   if (data) {
  //     window.location.href = '/';
  //   }

  const updatedProps = {
    ...props,
    notifications,
    loading: notificationsResponse.loading,
    markAsRead,
  };

  return <Notifications {...updatedProps} />;
}

export default NotificationsContainer;
