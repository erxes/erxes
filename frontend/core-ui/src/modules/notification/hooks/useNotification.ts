import { NOTIFICATION_DETAIL } from '@/notification/graphql/notificationsQueries';
import { useMarkAsReadNotification } from '@/notification/hooks/useMarkAsReadNotification';
import { useNotificationNavigation } from '@/notification/hooks/useNotificationNavigation';
import type { UseNotificationResult } from '@/notification/types/myInbox';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import type { TNotification } from 'ui-modules';

export const useNotification = (): UseNotificationResult => {
  const { id } = useParams();
  const { data, loading, error } = useQuery<{
    notificationDetail: TNotification;
  }>(NOTIFICATION_DETAIL, { variables: { _id: id }, skip: !id });
  const notification = id ? data?.notificationDetail : undefined;
  const handleMarkAsRead = useMarkAsReadNotification();
  const navigation = useNotificationNavigation({
    id,
    notification,
    handleMarkAsRead,
  });

  return { id, notification, loading, error, ...navigation };
};
