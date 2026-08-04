import { Document, Schema } from 'mongoose';

export type TEmailHandoffStatus = 'queued' | 'sent' | 'failed';

export type TEmailDeliveryStatus =
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'dropped';

export interface IEmailDeliveryDocument extends Document {
  _id: string;

  notificationId?: string;
  userId?: string;

  source?: string;
  sourceId?: string;

  lane?: 'proven' | 'unknown';

  toEmails: string[];
  ccEmails?: string[];
  from?: string;
  subject: string;
  content?: string;

  provider: 'sendgrid' | 'smtp' | 'ses';
  messageId?: string;
  providerResponse?: string;

  status: TEmailHandoffStatus;
  sentAt?: Date;
  error?: string;

  rejected: string[];

  deliveryStatus?: TEmailDeliveryStatus;
  deliveryStatusAt?: Date;
  bounced: string[];
  complained: string[];
  opened: string[];
  clicked: string[];

  createdAt: Date;
  updatedAt: Date;
}

const RETENTION_SECONDS = 60 * 60 * 24 * 90;

export const emailDeliverySchema = new Schema({
  notificationId: {
    type: String,
    index: true,
  },

  userId: {
    type: String,
  },

  source: {
    type: String,
  },

  sourceId: {
    type: String,
  },

  lane: {
    type: String,
    enum: ['proven', 'unknown'],
  },

  toEmails: {
    type: [String],
    default: [],
    index: true,
  },

  ccEmails: {
    type: [String],
    default: [],
  },

  from: {
    type: String,
  },

  subject: {
    type: String,
    default: '',
  },

  content: {
    type: String,
  },

  provider: {
    type: String,
    enum: ['sendgrid', 'smtp', 'ses'],
    required: true,
  },

  messageId: {
    type: String,
    index: true,
  },

  providerResponse: {
    type: String,
  },

  status: {
    type: String,
    enum: ['queued', 'sent', 'failed'],
    default: 'queued',
    index: true,
  },

  sentAt: {
    type: Date,
  },

  error: {
    type: String,
  },

  rejected: {
    type: [String],
    default: [],
  },

  deliveryStatus: {
    type: String,
    enum: [
      'delivered',
      'opened',
      'clicked',
      'bounced',
      'complained',
      'dropped',
    ],
  },

  deliveryStatusAt: {
    type: Date,
  },

  bounced: {
    type: [String],
    default: [],
  },

  complained: {
    type: [String],
    default: [],
  },

  opened: {
    type: [String],
    default: [],
  },

  clicked: {
    type: [String],
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: RETENTION_SECONDS,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for analytics
emailDeliverySchema.index({ userId: 1, createdAt: -1 });
emailDeliverySchema.index({ status: 1, createdAt: -1 });
emailDeliverySchema.index({ provider: 1, status: 1 });
emailDeliverySchema.index({ source: 1, sourceId: 1 });
emailDeliverySchema.index({ createdAt: -1, lane: 1 });
