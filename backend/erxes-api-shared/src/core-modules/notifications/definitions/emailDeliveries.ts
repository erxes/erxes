import { Document, Schema } from 'mongoose';

// Email delivery tracking
export interface IEmailDeliveryDocument extends Document {
  _id: string;
  notificationId?: string;
  userId: string;
  email: string;
  subject: string;
  content: string;

  // Email service data
  provider: 'sendgrid' | 'smtp' | 'ses';
  messageId?: string;

  // Status tracking
  status:
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounced'
    | 'failed';
  sentAt?: Date;

  // Error handling
  error?: string;
  retryCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const emailDeliverySchema = new Schema({
  notificationId: {
    type: String,
    index: true,
  },

  userId: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
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

  status: {
    type: String,
    enum: [
      'pending',
      'sent',
      'delivered',
      'opened',
      'clicked',
      'bounced',
      'failed',
    ],
    default: 'pending',
    index: true,
  },

  sentAt: {
    type: Date,
  },

  error: {
    type: String,
  },

  retryCount: {
    type: Number,
    default: 0,
  },

  webhookData: {
    type: Schema.Types.Mixed,
  },

  createdAt: {
    type: Date,
    default: Date.now,
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
