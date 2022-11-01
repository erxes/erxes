import React from 'react';

import Spinner from '../../../common/Spinner';
import { INotification } from '../../../types';

type Props = {
  notification: INotification;
  loading: boolean;
  refetch?: () => void;
};

const NotificationDetail = (props: Props) => {
  const { loading, notification } = props;

  if (loading) {
    return <Spinner />;
  }

  if (!notification) {
    return <h2>Notification not found</h2>;
  }

  return <p>{notification.title}</p>;
};

export default NotificationDetail;
