import { useMultiQueryState } from 'erxes-ui';
import type { TNotificationStatus } from 'ui-modules';
import {
  NOTIFICATION_CONTENT_FILTER_QUERY_KEYS,
  NOTIFICATION_FILTER_QUERY_KEYS,
} from '@/notification/constants/notifications';
import type { NotificationFilterQueryState } from '@/notification/types/notificationFilters';

interface NotificationFilterControls {
  status: TNotificationStatus;
  hasActiveFilters: boolean;
  setStatus: (status: TNotificationStatus) => void;
  clearFilters: () => void;
}

export const useNotificationFilterControls = (): NotificationFilterControls => {
  const [queries, setQueries] =
    useMultiQueryState<NotificationFilterQueryState>(
      NOTIFICATION_FILTER_QUERY_KEYS,
    );
  const status = queries.notificationStatus;

  return {
    status: status === 'all' || status === 'read' ? status : 'unread',
    hasActiveFilters: NOTIFICATION_CONTENT_FILTER_QUERY_KEYS.some((key) =>
      Boolean(queries[key]),
    ),
    setStatus: (nextStatus) => {
      setQueries({
        notificationStatus: nextStatus === 'unread' ? null : nextStatus,
        ...(nextStatus === 'unread' &&
          queries.notificationOrderBy === 'readAt' && {
            notificationOrderBy: null,
          }),
      });
    },
    clearFilters: () => {
      setQueries(
        Object.fromEntries(
          NOTIFICATION_CONTENT_FILTER_QUERY_KEYS.map((key) => [key, null]),
        ),
      );
    },
  };
};
