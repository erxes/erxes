import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ICPNotification {
  title?: string;
  content?: string;
  link?: string;
  receiver?: string;
  notifType?: 'engage' | 'system';
  clientPortalId: string;
}

export interface ICPNotificationDocument extends ICPNotification, Document {
  _id: string;
  createdUser?: string;
  receiver: string;
  createdAt: Date;
  isRead: boolean;
}

export const cpNotificationSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  link: field({ type: String }),
  content: field({ type: String }),
  createdUser: field({ type: String }),
  receiver: field({ type: String, index: true }),
  createdAt: field({
    type: Date,
    default: Date.now
  }),
  isRead: field({
    type: Boolean,
    default: false
  }),
  notifType: field({
    type: String
  }),
  clientPortalId: field({
    type: String,
    index: true
  })
});
