import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { mutations } from '../../../user/graphql';
import Notifications from '../../components/notifications/List';
import {
  IUser,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse,
} from '../../../types';
import { useRouter } from 'next/router';

type Props = {
  count: number;
  currentUser: IUser;
  requireRead?: boolean;
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
      createdAt
      isRead
      title
    }
  }
`;

const markAsReadMutation = gql`
  mutation ClientPortalNotificationsMarkAsRead($ids: [String]) {
    clientPortalNotificationsMarkAsRead(_ids: $ids)
  }
`;

function NotificationsContainer(props: Props) {
  const router = useRouter()

  const [markAsReadMutaion] = useMutation(markAsReadMutation);

  const markAsRead = (notificationIds?: string[]) => {
    console.log('markAsRead', notificationIds);
  };

  const onClickNotification = (notificationId: string) => {
    markAsReadMutaion({
      variables: {
        ids: [notificationId],
      },
    }).then(() => {
      // router.push(`/notification/${notificationId}`)
    });
  };

  const notificationsResponse = useQuery<NotificationsQueryResponse>(
    notificationsQuery,
    {
      skip: !props.currentUser,
      variables: {
        requireRead: props.requireRead,
        page: 1,
        perPage: 10,
      },
      fetchPolicy: 'network-only',
    }
  );

  const notifications =
    (notificationsResponse.data &&
      notificationsResponse.data.clientPortalNotifications) ||
    [];

  console.log('notifications', notifications);

  const updatedProps = {
    ...props,
    notifications,
    loading: notificationsResponse.loading,
    markAsRead,
    onClickNotification,
  };

  return <Notifications {...updatedProps} />;
}

export default NotificationsContainer;
