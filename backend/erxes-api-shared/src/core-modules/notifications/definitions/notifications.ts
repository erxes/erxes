import { Document, Schema } from 'mongoose';
import type { TCreatedVia } from '../../../core-types/common';

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
  contentType: string;
  contentTypeId?: string; // target object ID

  // Status
  isRead: boolean;
  readAt?: Date;
  isArchived?: boolean;

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
  createdVia?: TCreatedVia;
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
      default: 'info',
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
    isArchived: { type: Boolean, default: false },

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

    // What sent it when no person did: the same provenance `schemaWrapper`
    // gives other records. Absent on notifications people caused.
    createdVia: {
      type: {
        source: { type: String },
        sourceId: { type: String },
        sourceName: { type: String, optional: true },
        runId: { type: String, optional: true },
        actorId: { type: String, optional: true },
      },
      optional: true,
      default: undefined,
      _id: false,
    },
  },
  { timestamps: true },
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ contentType: 1, contentTypeId: 1 });
notificationSchema.index({ expiresAt: 1 }); // MongoDB TTL index
