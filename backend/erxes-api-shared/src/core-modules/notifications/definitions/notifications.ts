import { Document, Schema } from 'mongoose';

// Notification schema for in-app notifications
export interface INotificationDocument extends Document {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';

  // Recipients and sender
  userId: string;
  fromUserId?: string;

  // Source information for plugin widgets
  contentType: string; // 'frontline:conversation', 'sales:deal', etc.
  contentTypeId?: string; // target object ID

  // Status
  isRead: boolean;
  readAt?: Date;

  // Additional data
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityLevel: 1 | 2 | 3 | 4;
  metadata?: any; // plugin-specific data
  action?: string;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date; // Auto-cleanup old notifications
  updatedAt?: Date;
  kind: 'system' | 'user';
}

export const notificationSchema = new Schema(
  {
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
    },

    userId: {
      type: String,
      required: true,
    },

    fromUserId: {
      type: String,
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
      type: String,
      enum: [1, 2, 3, 4],
      default: 2,
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
    },

    action: {
      type: String,
      index: true,
      optional: true,
    },

    kind: {
      type: String,
      enum: ['system', 'user'],
      default: 'user',
      index: true,
    },
  },
  { timestamps: true },
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ contentType: 1, contentTypeId: 1 });
notificationSchema.index({ expiresAt: 1 }); // MongoDB TTL index
