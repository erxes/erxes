import { gql, useMutation, useQuery } from "@apollo/client";

import { IUser } from "../../../types";
import Notifications from "../../components/notifications/List";
import React from "react";

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
  const [markAsReadMutaion] = useMutation(markAsReadMutation);

  const onClickNotification = (notificationId: string) => {
    markAsReadMutaion({
      variables: {
        ids: [notificationId],
      },
    });
  };

  const notificationsResponse = useQuery(notificationsQuery, {
    skip: !props.currentUser,
    variables: {
      requireRead: props.requireRead,
      page: 1,
      perPage: 10,
    },
    fetchPolicy: "network-only",
  });

  const notifications =
    (notificationsResponse.data &&
      notificationsResponse.data.clientPortalNotifications) ||
    [];

  const refetch = () => {
    notificationsResponse.refetch();
  };

  const updatedProps = {
    ...props,
    notifications,
    loading: notificationsResponse.loading,
    onClickNotification,
    refetch,
  };

  return <Notifications {...updatedProps} />;
}

export default NotificationsContainer;
