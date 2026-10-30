import { useAtomValue } from 'jotai';
import { inboxDisplayOptionsState } from '@/notification/states/notificationState';
import { parseDateRangeFromString, useNonNullMultiQueryState } from 'erxes-ui';
import { NOTIFICATION_FILTER_QUERY_KEYS } from '@/notification/constants/notifications';
import type {
  NotificationFilterQueryState,
  NotificationFilterVariables,
} from '@/notification/types/notificationFilters';

export const useNotificationFilters = (): NotificationFilterVariables => {
  const display = useAtomValue(inboxDisplayOptionsState);
  const {
    notificationStatus: status,
    notificationPriority: priority,
    notificationType: type,
    notificationCreatedAt: createdAt,
    notificationOrderBy: orderBy,
    notificationFromUserId: fromUserId,
    notificationModule: module,
    notificationPlugin: plugin,
  } = useNonNullMultiQueryState<NotificationFilterQueryState>(
    NOTIFICATION_FILTER_QUERY_KEYS,
  );

  const orderByFilter = (): Record<string, 1 | -1> => {
    if (orderBy === 'old') {
      return { createdAt: 1 };
    } else if (orderBy === 'priority') {
      return { priority: -1 };
    }
    if (orderBy === 'readAt') return { readAt: -1 };
    return {};
  };

  const orderByValue = orderByFilter();
  let statusValue: NotificationFilterVariables['status'] = 'UNREAD';
  if (status === 'read') statusValue = 'READ';
  else if (status === 'all') statusValue = 'ALL';

  return {
    status: statusValue,
    priority: priority?.toUpperCase(),
    type: type?.toUpperCase(),
    fromDate: parseDateRangeFromString(createdAt)?.from,
    endDate: parseDateRangeFromString(createdAt)?.to,
    ...(Object.keys(orderByValue).length > 0 && { orderBy: orderByValue }),
    fromUserId: fromUserId ?? undefined,
    module: module ?? undefined,
    plugin: plugin ?? undefined,
    unreadFirst: display.unreadFirst,
  };
};
