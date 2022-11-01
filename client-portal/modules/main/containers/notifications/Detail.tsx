import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';

import { IUser, NotificationDetailQueryResponse } from '../../../types';
import NotificationDetail from '../../components/notifications/Detail';

type Props = {
  _id: string;
  currentUser: IUser;
};

const notificationDetailQuery = gql`
  query ClientPortalNotificationDetail($id: String!) {
    clientPortalNotificationDetail(_id: $id) {
      _id
      content
      createdAt
      link
      notifType
      title
    }
  }
`;

const markAsReadMutation = gql`
  mutation ClientPortalNotificationsMarkAsRead($ids: [String]) {
    clientPortalNotificationsMarkAsRead(_ids: $ids)
  }
`;

function NotificationDetailContainer(props: Props) {
  const [markAsRead] = useMutation(markAsReadMutation);

  const response = useQuery<NotificationDetailQueryResponse>(
    notificationDetailQuery,
    {
      skip: !props.currentUser,
      variables: {
        id: props._id,
      },
    }
  );

  const notification =
    (response.data && response.data.clientPortalNotificationDetail) || null;

  if (response.data || !response.error) {
    markAsRead({
      variables: {
        ids: [props._id],
      },
    });
  }

  const updatedProps = {
    ...props,
    notification,
    loading: response.loading,
  };

  return <NotificationDetail {...updatedProps} />;
}

export default NotificationDetailContainer;
