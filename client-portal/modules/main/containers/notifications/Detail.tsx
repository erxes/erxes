import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

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
      isRead
    }
  }
`;

function NotificationDetailContainer(props: Props) {
  // const [markAsRead] = useMutation(markAsReadMutation);

  const removeNotification = (notificationId: string) => {
    console.log('removeNotification', notificationId);
  };

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

  if (response.loading || !notification) {
    return <Spinner animation="border" />;
  }

  const updatedProps = {
    ...props,
    notification,
    removeNotification,
  };

  return <NotificationDetail {...updatedProps} />;
}

export default NotificationDetailContainer;
