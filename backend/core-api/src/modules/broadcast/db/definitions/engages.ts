import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { CAMPAIGN_KINDS, CAMPAIGN_METHODS } from '../../constants';
import {
  emailSchema,
  messengerSchema,
  notificationSchema,
  scheduleDateSchema,
  smsSchema,
} from './common';

export const engageMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  kind: {
    type: String,
    enum: CAMPAIGN_KINDS.ALL,
    label: 'Kind',
    required: true,
  },
  segmentId: { type: String, label: 'Segment Id' },
  segmentIds: { type: [String], label: 'Segments' },
  brandIds: { type: [String], label: 'Brands' },
  customerIds: { type: [String], label: 'Customers', required: true },
  cpId: { type: String, label: 'Client Portal Id', required: true },
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
  stopDate: { type: Date, label: 'Stop date', required: true },
  createdAt: {
    type: Date,
    label: 'Created at',
    default: Date.now,
    index: true,
  },
  tagIds: { type: [String], label: 'Tags', index: true },
  customerTagIds: { type: [String], label: 'Chosen customer tag ids' },
  messengerReceivedCustomerIds: {
    type: [String],
    label: 'Received customers',
    required: true,
  },
  email: { type: emailSchema, label: 'Email', required: true },
  scheduleDate: {
    type: scheduleDateSchema,
    label: 'Schedule date',
    required: true,
  },
  messenger: { type: messengerSchema, label: 'Messenger', required: true },
  lastRunAt: { type: Date, label: 'Last run at' },
  notification: {
    type: notificationSchema,
    label: 'Notification',
    required: true,
  },
  totalCustomersCount: { type: Number, label: 'Total customers count' },
  validCustomersCount: { type: Number, label: 'Valid customers count' },
  shortMessage: { type: smsSchema, label: 'Short message', required: true },
  createdBy: { type: String, label: 'Created user id', required: true },
  runCount: { type: Number, label: 'Run count', default: 0 },
});
