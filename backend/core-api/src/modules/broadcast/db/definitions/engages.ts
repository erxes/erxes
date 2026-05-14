import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { CAMPAIGN_KINDS, CAMPAIGN_METHODS } from '../../constants';
import { emailSchema, messengerSchema, notificationSchema } from './common';

export const engageMessageSchema = new Schema(
  {
    _id: mongooseStringRandomId,

    kind: {
      type: String,
      enum: CAMPAIGN_KINDS.ALL,
      label: 'Kind',
      required: true,
    },

    targetType: { type: String, label: 'Target type' },
    targetIds: { type: [String], label: 'Target IDs' },
    targetCount: { type: Number, label: 'Target count' },

    title: { type: String, label: 'Title', required: true },
    fromUserId: { type: String, label: 'From user', required: true },

    method: {
      type: String,
      enum: CAMPAIGN_METHODS.ALL,
      label: 'Method',
      required: true,
    },

    isDraft: { type: Boolean, label: 'Is draft', required: true },
    isLive: { type: Boolean, label: 'Is live', required: true },

    messengerReceivedCustomerIds: {
      type: [String],
      label: 'Received customers',
      required: true,
    },
    email: { type: emailSchema, label: 'Email' },
    messenger: { type: messengerSchema, label: 'Messenger' },
    notification: {
      type: notificationSchema,
      label: 'Notification',
    },

    lastRunAt: { type: Date, label: 'Last run at' },
    runCount: { type: Number, label: 'Run count', default: 0 },

    status: {
      type: String,
      enum: ['sending', 'completed', 'failed'],
      label: 'Status',
    },

    progress: {
      totalBatches: { type: Number, label: 'Total batches' },
      processedBatches: { type: Number, label: 'Processed batches' },
      successCount: { type: Number, label: 'Success count' },
      failureCount: { type: Number, label: 'Failure count' },
      lastUpdated: { type: Date, label: 'Last updated' },
    },

    totalCustomersCount: { type: Number, label: 'Total customers count' },
    validCustomersCount: { type: Number, label: 'Valid customers count' },

    createdBy: { type: String, label: 'Created user id', required: true },
  },
  {
    timestamps: true,
  },
);
