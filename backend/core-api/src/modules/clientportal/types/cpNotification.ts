import { Document } from 'mongoose';

export interface ICPNotification {
  _id?: string;
  cpUserId: string;
  clientPortalId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  contentType?: string;
  contentTypeId?: string;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityLevel: 1 | 2 | 3 | 4;
  metadata?: any;
  action?: string;
  kind: 'system' | 'user';
  /** Result of sending push: which platforms had FCM tokens */
  result?: {
    ios?: boolean;
    android?: boolean;
    web?: boolean;
  };
  createdAt?: Date;
  expiresAt?: Date;
  updatedAt?: Date;
}

export interface ICPNotificationDocument extends ICPNotification, Document {
  _id: string;
}
