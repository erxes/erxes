export type PortalNotification = {
  _id: string;
  title: string;
  message: string;
  type: string | null;
  contentType: string | null;
  contentTypeId: string | null;
  isRead: boolean;
  priority: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type NotificationPageInfo = {
  hasNextPage: boolean | null;
  endCursor: string | null;
};

export type NotificationListResponse = {
  clientPortalNotifications: {
    list: PortalNotification[] | null;
    totalCount: number | null;
    pageInfo: NotificationPageInfo | null;
  } | null;
};

export type MarkReadResponse = {
  clientPortalMarkNotificationAsRead: unknown;
};

export type MarkAllReadResponse = {
  clientPortalMarkAllNotificationsAsRead: unknown;
};
