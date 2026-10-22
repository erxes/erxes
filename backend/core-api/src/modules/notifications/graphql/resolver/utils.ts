import type { INotificationDocument } from 'erxes-api-shared/core-modules';
import type { FilterQuery, SortOrder } from 'mongoose';

export interface NotificationFilters {
  status?: string;
  priority?: string;
  type?: string;
  fromDate?: string;
  endDate?: string;
  module?: string;
  fromUserId?: string;
  ids?: string[];
  unreadFirst?: boolean;
}

export const generateNotificationsFilter = (
  params: NotificationFilters = {},
): FilterQuery<INotificationDocument> => {
  const filter: FilterQuery<INotificationDocument> = {};
  const { status, priority, type, ids = [] } = params;
  if (ids.length) filter._id = { $nin: ids };
  if (status?.toLowerCase() === 'read') filter.isRead = true;
  if (status?.toLowerCase() === 'unread') filter.isRead = false;
  if (priority) filter.priority = priority.toLowerCase();
  if (type) filter.type = type.toLowerCase();
  const date = (value: string): Date => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()))
      throw new Error('Invalid notification date');
    return parsed;
  };
  if (params.fromDate || params.endDate) {
    filter.createdAt = {
      ...(params.fromDate && { $gte: date(params.fromDate) }),
      ...(params.endDate && { $lte: date(params.endDate) }),
    };
  }
  if (params.fromUserId) {
    filter.fromUserId = { $in: params.fromUserId.split(',').filter(Boolean) };
  }
  if (params.module === 'approval') {
    filter.contentType = { $in: ['core:approval', 'core.approval'] };
  }
  return filter;
};

export const generateActiveNotificationsFilter =
  (): FilterQuery<INotificationDocument> => ({
    isArchived: { $ne: true },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

export const generateOrderByNotifications = (
  orderBy?: Record<string, SortOrder>,
  unreadFirst = true,
): Record<string, 1 | -1> => ({
  ...(unreadFirst ? { isRead: 1 } : {}),
  ...(orderBy?.priority
    ? { priorityLevel: orderBy.priority === 1 ? 1 : -1 }
    : {}),
  ...(orderBy?.readAt ? { readAt: orderBy.readAt === 1 ? 1 : -1 } : {}),
  createdAt: orderBy?.createdAt === 1 ? 1 : -1,
});
