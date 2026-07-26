import { Document, Schema } from 'mongoose';

/** Result of handing the message to the provider. Always known. */
export type TEmailHandoffStatus = 'queued' | 'sent' | 'failed';

/**
 * Derived from provider webhooks, so it only ever exists for providers that
 * push events. SMTP deliveries leave this undefined forever.
 */
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

  /**
   * What produced this email and the record it came from. Free-form so plugins
   * can introduce their own sources without editing this schema. Core uses
   * 'automation', 'broadcast' and 'transactional'.
   */
  source?: string;
  sourceId?: string;

  toEmails: string[];
  ccEmails?: string[];
  from?: string;
  subject: string;
  /** Bodies live on the source record; only stored when explicitly asked for. */
  content?: string;

  provider: 'sendgrid' | 'smtp' | 'ses';
  messageId?: string;
  /** Raw provider reply, stored verbatim and never parsed. */
  providerResponse?: string;

  status: TEmailHandoffStatus;
  sentAt?: Date;
  error?: string;

  /** Refused by the provider during handoff, before any delivery attempt. */
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
    // Delivery rows are operational, not archival. Expire them so the
    // collection stays bounded without an external cleanup job.
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
