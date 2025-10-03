export const generateNotificationsFilter = (params: {
  status: 'unread' | 'read' | 'all';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'low' | 'medium' | 'high' | 'urgent';
  fromDate: string;
  endDate: string;
  module: string;
  fromUserId: string;
  ids: string[];
}) => {
  const { status = '', priority, type, ids = [] } = params || {};
  const filter: any = {};

  if (ids.length) {
    filter._id = { $nin: ids };
  }

  if (status?.toLowerCase() === 'read') {
    filter.isRead = true;
  }

  if (status?.toLowerCase() === 'unread') {
    filter.isRead = false;
  }

  if (priority) {
    filter.priority = priority.toLowerCase();
  }

  if (type) {
    filter.type = type.toLowerCase();
  }

  if (params?.fromDate) {
    filter.createdAt = { $gte: params.fromDate };
  }

  if (params?.endDate) {
    filter.createdAt = { ...(filter.createdAt || {}), $lte: params.endDate };
  }

  if (params?.fromUserId) {
    filter.fromUserId = params.fromUserId;
  }

  return filter;
};
