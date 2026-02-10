import { Schema, Document } from 'mongoose';
import { mongooseStringRandomId } from '../../../utils';

export interface ICPNotificationDocument extends Document {
  _id: string;
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
  createdAt: Date;
  expiresAt?: Date;
  updatedAt: Date;
}

export const cpNotificationSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    cpUserId: {
      type: String,
      required: true,
      index: true,
    },
    clientPortalId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      required: true,
      default: 'info',
    },
    contentType: {
      type: String,
    },
    contentTypeId: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    priorityLevel: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 2,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    action: {
      type: String,
      index: true,
    },
    kind: {
      type: String,
      enum: ['system', 'user'],
      default: 'user',
      index: true,
    },
    result: {
      ios: { type: Boolean },
      android: { type: Boolean },
      web: { type: Boolean },
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

cpNotificationSchema.index({ cpUserId: 1, createdAt: -1 });
cpNotificationSchema.index({ clientPortalId: 1, cpUserId: 1, isRead: 1 });
cpNotificationSchema.index({ contentType: 1, contentTypeId: 1, cpUserId: 1 });
