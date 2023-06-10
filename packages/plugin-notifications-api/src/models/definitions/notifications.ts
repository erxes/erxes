import { Document, Schema } from 'mongoose';
import { NOTIFICATION_TYPES } from '../../constants';
import { field } from './utils';

export interface INotification {
  notifType?: string;
  title?: string;
  content?: string;
  link?: string;
  contentType?: string;
  contentTypeId?: string;
  receiver?: string;
  action?: string;
}

export interface INotificationDocument extends INotification, Document {
  _id: string;
  createdUser?: string;
  receiver: string;
  date: Date;
  isRead: boolean;
}

export const notificationSchema = new Schema({
  _id: field({ pkey: true }),
  notifType: field({
    type: String,
    enum: NOTIFICATION_TYPES.ALL
  }),
  action: field({
    type: String,
    optional: true
  }),
  title: field({ type: String }),
  link: field({ type: String }),
  content: field({ type: String }),
  createdUser: field({ type: String }),
  receiver: field({ type: String, index: true }),
  contentType: field({ type: String, index: true }),
  contentTypeId: field({ type: String, index: true }),
  date: field({
    type: Date,
    default: Date.now,
    index: true
  }),
  isRead: field({
    type: Boolean,
    default: false,
    index: true
  })
});

notificationSchema.index({
  receiver: 1,
  isRead: 1,
  title: 1,
  notifType: 1,
  contentType: 1,
  date: 1
});

export interface IConfig {
  user?: string;
  notifType?: string;
  isAllowed?: boolean;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  // to whom this config is related
  user: field({ type: String }),
  notifType: field({
    type: String,
    enum: NOTIFICATION_TYPES.ALL
  }),
  isAllowed: field({ type: Boolean })
});
