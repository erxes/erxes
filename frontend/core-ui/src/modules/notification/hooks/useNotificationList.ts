import { useAtomValue } from 'jotai';
import { hiddenNotificationIdsState } from '@/notification/states/notificationState';
import { useInView } from 'react-intersection-observer';
import { useNotifications } from '@/notification/hooks/useNotifications';
import { useNotificationFilters } from '@/notification/hooks/useNotificationFilters';
import type { UseNotificationListResult } from '@/notification/types/myInbox';

export const useNotificationList = (): UseNotificationListResult => {
  const {
    notifications,
    loading,
    handleFetchMore,
    totalCount,
    error,
    retry,
    fetchingMore,
    fetchMoreError,
  } = useNotifications();
  const { status } = useNotificationFilters();
  const hiddenIds = useAtomValue(hiddenNotificationIdsState);
  const { ref: inViewRef } = useInView({
    onChange: (inView) => {
      if (inView) void handleFetchMore();
    },
  });
  const visible = notifications.filter(
    (item) =>
      !hiddenIds.includes(item._id) &&
      (status === 'ALL' || (status === 'READ' ? item.isRead : !item.isRead)),
  );
  return {
    notifications: visible,
    loading,
    inViewRef,
    isEmpty:
      !loading &&
      !error &&
      visible.length === 0 &&
      totalCount <= notifications.length,
    hasMore: !!notifications.length && totalCount > notifications.length,
    error,
    retry,
    fetchingMore,
    fetchMoreError,
    loadMore: () => handleFetchMore(true),
  };
};
