import { Document } from 'mongoose';

export interface INotification {
  title?: string;
  content?: string;
  link?: string;
  receiver?: string;
  notifType?: 'engage' | 'system';
  clientPortalId: string;
  eventData?: any | null;
  groupId?: string;
}

export interface INotificationDocument extends INotification, Document {
  _id: string;
  createdUser?: string;
  receiver: string;
  createdAt: Date;
  isRead: boolean;
}
