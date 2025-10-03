import {
  NotificationOrderByT,
  NotificationPriorityT,
  NotificationTypeT,
} from '@/notification/my-inbox/types/notifications';
import { parseDateRangeFromString, useNonNullMultiQueryState } from 'erxes-ui';
import { NotificationStatusT } from '@/notification/my-inbox/types/notifications';

export const useNotificationFilters = () => {
  const { status, priority, type, createdAt, orderBy, fromUserId } =
    useNonNullMultiQueryState<{
      status: NotificationStatusT;
      priority: NotificationPriorityT;
      type: NotificationTypeT;
      createdAt: string;
      orderBy: NotificationOrderByT;
      fromUserId: string;
    }>(['status', 'type', 'priority', 'createdAt', 'orderBy', 'fromUserId']);
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
    status: status?.toUpperCase(),
    priority: priority?.toUpperCase(),
    type: type?.toUpperCase(),
    fromDate: parseDateRangeFromString(createdAt)?.from,
    endDate: parseDateRangeFromString(createdAt)?.to,
    ...(Object.keys(orderByValue).length > 0 && { orderBy: orderByValue }),
    fromUserId,
  };
};
