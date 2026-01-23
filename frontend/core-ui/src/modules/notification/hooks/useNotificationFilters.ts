import {
  NotificationOrderByT,
  NotificationPriorityT,
  NotificationTypeT,
} from '@/notification/types/notifications';
import { parseDateRangeFromString, useNonNullMultiQueryState } from 'erxes-ui';
import { NotificationStatusT } from '@/notification/types/notifications';

export const useNotificationFilters = () => {
  const { notificationStatus: status, notificationPriority: priority, notificationType: type, notificationCreatedAt: createdAt, notificationOrderBy: orderBy, notificationFromUserId: fromUserId } =
    useNonNullMultiQueryState<{
      notificationStatus: NotificationStatusT;
      notificationPriority: NotificationPriorityT;
      notificationType: NotificationTypeT;
      notificationCreatedAt: string;
      notificationOrderBy: NotificationOrderByT;
      notificationFromUserId: string;
    }>(['notificationStatus', 'notificationType', 'notificationPriority', 'notificationCreatedAt', 'notificationOrderBy', 'notificationFromUserId']);

  const orderByFilter = () => {
    if (orderBy === 'old') {
      return { createdAt: 1 };
    } else if (orderBy === 'priority') {
      return { priority: -1 };
    }
    return {};
  };

  const orderByValue = orderByFilter();

  return {
    status: status?.toUpperCase() || 'UNREAD',
    priority: priority?.toUpperCase(),
    type: type?.toUpperCase(),
    fromDate: parseDateRangeFromString(createdAt)?.from,
    endDate: parseDateRangeFromString(createdAt)?.to,
    ...(Object.keys(orderByValue).length > 0 && { orderBy: orderByValue }),
    fromUserId,
  };
};
