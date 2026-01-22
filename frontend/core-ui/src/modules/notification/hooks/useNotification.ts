import { NOTIFICATION_DETAIL } from '@/notification/graphql/notificationsQueries';
import { useMarkAsReadNotification } from '@/notification/hooks/useMarkAsReadNotification';
import { INotification } from '@/notification/types/notifications';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate, useParams } from 'react-router';
import { useSetAtom } from 'jotai';
import { hiddenNotificationIdsState } from '../states/notificationState';
import { useNotifications } from './useNotifications';

export const useNotification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useQuery<{ notificationDetail: INotification }>(
    NOTIFICATION_DETAIL,
    { variables: { _id: id }, skip: !id },
  );
  const { notifications } = useNotifications();

  const setHiddenNotificationIds = useSetAtom(hiddenNotificationIdsState);
  const handleMarkAsRead = useMarkAsReadNotification();
  const currentNotificationIndex = notifications.findIndex(
    (notif) => notif._id === id,
  );
  const nextNotification = notifications[currentNotificationIndex + 1];

  const { notificationDetail } = data || {};

  useEffect(() => {
    if (notificationDetail && !notificationDetail.isRead) {
      const timer = setTimeout(() => {
        handleMarkAsRead(notificationDetail._id);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notificationDetail]);

  useHotkeys('mod+backspace', () => {
    if (!notificationDetail) return;
    setHiddenNotificationIds((prev) => [...prev, notificationDetail._id]);
    if (notificationDetail.isRead) {
      handleMarkAsRead(notificationDetail._id);
    }
    if (nextNotification) {
      navigate(`/my-inbox/${nextNotification._id}${window.location.search}`);
    }
  });

  return {
    id,
    notification: data?.notificationDetail,
    loading,
  };
};
