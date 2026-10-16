import { useAtomValue } from 'jotai';
import { useInView } from 'react-intersection-observer';
import { useNotifications } from '@/notification/hooks/useNotifications';
import { hiddenNotificationIdsState } from '@/notification/states/notificationState';
import type { UseNotificationListResult } from '@/notification/types/myInbox';

export const useNotificationList = (): UseNotificationListResult => {
  const hiddenNotificationIds = useAtomValue(hiddenNotificationIdsState);
  const { notifications, loading, handleFetchMore, totalCount } =
    useNotifications();
  const { ref: inViewRef } = useInView({
    onChange: (inView) => {
      if (inView) handleFetchMore();
    },
  });
  const filteredNotifications = notifications.filter(
    (notification) => !hiddenNotificationIds.includes(notification._id),
  );

  return {
    notifications: filteredNotifications,
    loading,
    inViewRef,
    isEmpty:
      !loading &&
      filteredNotifications.length === 0 &&
      totalCount <= notifications.length,
    hasMore: notifications.length > 0 && totalCount > notifications.length,
  };
};
