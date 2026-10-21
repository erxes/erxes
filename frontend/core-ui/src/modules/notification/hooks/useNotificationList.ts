import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  hiddenNotificationIdsState,
  inboxDisplayOptionsState,
} from '@/notification/states/notificationState';
import { groupNotifications } from '@/notification/utils/groupNotifications';
import { groupNotificationsByAuthor } from '@/notification/utils/groupNotificationsByAuthor';
import { useInView } from 'react-intersection-observer';
import { useNotifications } from '@/notification/hooks/useNotifications';
import { useNotificationFilters } from '@/notification/hooks/useNotificationFilters';
import type { UseNotificationListResult } from '@/notification/types/myInbox';

export const useNotificationList = (): UseNotificationListResult => {
  const unread = useNotifications({ variables: { status: 'UNREAD' } });
  const seen = useNotifications({
    variables: { status: 'READ', unreadFirst: false },
  });
  const { status } = useNotificationFilters();
  const {
    notifications,
    loading,
    handleFetchMore,
    totalCount,
    error,
    retry,
    fetchingMore,
    fetchMoreError,
    pageInfo,
  } = status === 'READ' ? seen : unread;
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
      (status === 'READ' ? item.isRead : !item.isRead),
  );
  const groups = groupNotifications(
    visible,
    grouping,
    i18n.language,
    t('system', 'System'),
    unreadFirst,
  );
  const hasMore = !!pageInfo?.hasNextPage;
  return {
    unreadCount: unread.loading || unread.error ? undefined : unread.totalCount,
    seenCount: seen.loading || seen.error ? undefined : seen.totalCount,
    groups,
    notifications: groups.flatMap(([, items]) =>
      groupNotificationsByAuthor(items).flatMap((group) => group.items),
    ),
    loading,
    inViewRef,
    isEmpty:
      !loading &&
      !error &&
      visible.length === 0 &&
      totalCount <= notifications.length,
    hasMore,
    error,
    retry,
    fetchingMore,
    fetchMoreError,
    loadMore: () => handleFetchMore(true),
  };
};
