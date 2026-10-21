import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  hiddenNotificationIdsState,
  inboxDisplayOptionsState,
} from '@/notification/states/notificationState';
import { groupNotifications } from '@/notification/utils/groupNotifications';
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
  const { grouping, unreadFirst } = useAtomValue(inboxDisplayOptionsState);
  const { t, i18n } = useTranslation('common', { keyPrefix: 'notification' });
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
  const groups = groupNotifications(
    visible,
    grouping,
    i18n.language,
    t('system', 'System'),
    unreadFirst,
  );
  return {
    groups,
    notifications: groups.flatMap(([, items]) => items),
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
