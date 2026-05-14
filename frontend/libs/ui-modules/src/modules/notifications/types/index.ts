import { IUser } from '../../team-members';

export * from './welcome';

export enum TNotificationKind {
  SYSTEM = 'system',
  USER = 'user',
}

export type TNotificationStatus = 'read' | 'unread' | 'all';

export type TNotificationType = 'info' | 'success' | 'warning' | 'error';
export type TNotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TNotificationOrderBy = 'new' | 'old' | 'priority' | 'readAt';

export type TNotification = {
  _id: string;
  title: string;
  message: string;
  type: TNotificationType;
  fromUserId?: string;
  fromUser?: IUser;
  contentType?: string; // 'frontline:conversation', 'sales:deal', etc.
  contentTypeId?: string; // target object ID
  // Status
  isRead: boolean;
  readAt?: string;
  // Additional data
  priority: TNotificationPriority;
  metadata?: unknown; // plugin-specific data
  action?: string;

  // Timestamps
  kind: TNotificationKind;
  emailDelivery?: {
    _id: string;
    status: string;
    error?: string;
    sentAt: string;
  };
  createdAt: string;
  updatedAt?: string;
};
