import { NOTIFICATION_DETAIL } from '@/notification/my-inbox/graphql/notificationsQueries';
import { useMarkAsReadNotification } from '@/notification/my-inbox/hooks/useMarkAsReadNotification';
import { INotification } from '@/notification/my-inbox/types/notifications';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useParams } from 'react-router';

export const useNotification = () => {
  const { id } = useParams();
  const { data, loading } = useQuery<{ notificationDetail: INotification }>(
    NOTIFICATION_DETAIL,
    { variables: { _id: id }, skip: !id },
  );
  const handleMarkAsRead = useMarkAsReadNotification();
  const { notificationDetail } = data || {};

  useEffect(() => {
    if (notificationDetail) {
      const timer = setTimeout(() => {
        handleMarkAsRead(notificationDetail._id);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notificationDetail]);

  return {
    id,
    notification: data?.notificationDetail,
    loading,
  };
};
