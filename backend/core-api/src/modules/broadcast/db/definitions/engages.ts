import {
  CAMPAIGN_KINDS,
  CAMPAIGN_METHODS,
  MESSENGER_KINDS,
  SENT_AS_CHOICES,
} from '../../constants';
import { ruleSchema } from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';

// Schedule Date Schema

export const scheduleDateSchema = new Schema({
  type: { type: String, label: 'Type' },
  month: { type: String, label: 'Month' },
  day: { type: String, label: 'Day' },
  dateTime: {
    type: Date,
    label: 'DateTime',
    validate: {
      validator: (value: Date) => value > new Date(),
      message: 'Date time value must be greater than today',
    },
  },
});

// Email Schema
export const emailSchema = new Schema({
  attachments: { type: Object, label: 'Attachments' },
  subject: { type: String, label: 'Subject', required: true },
  sender: { type: String, label: 'Sender' },
  replyTo: { type: String, label: 'Reply to' },
  content: { type: String, label: 'Content', required: true },
  templateId: { type: String, label: 'Template' },
});

// Messenger Schema
export const messengerSchema = new Schema({
  brandId: { type: String, label: 'Brand', required: true },
  kind: {
    type: String,
    enum: MESSENGER_KINDS.ALL,
    label: 'Kind',
    required: true,
  },
  sentAs: {
    type: String,
    enum: SENT_AS_CHOICES.ALL,
    label: 'Sent as',
    required: true,
  },
  content: { type: String, label: 'Content', required: true },
  rules: { type: [ruleSchema], label: 'Rules', required: true },
});

// SMS Schema
export const smsSchema = new Schema({
  from: { type: String, label: 'From text' }, // optional учир required биш
  content: { type: String, label: 'SMS content', required: true },
  fromIntegrationId: {
    type: String,
    label: 'Configured integration',
    required: true,
  },
});

// Notification Schema
export const notificationSchema = new Schema({
  title: { type: String, label: 'Title', required: true },
  content: { type: String, label: 'Notification content', required: true },
  isMobile: { type: Boolean, label: 'Is mobile', required: true },
});

// Engage Message Schema
export const engageMessageSchema = new Schema({
  _id: { type: String, label: 'ID', required: true },
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

//   email: emailSchema,
export const engageMessageExtrasSchema = new Schema({
  scheduleDate: { type: scheduleDateSchema, required: true },
  messenger: { type: messengerSchema, required: true },
  shortMessage: { type: smsSchema, required: true },
  notification: { type: notificationSchema, required: true },

  lastRunAt: { type: Date },
  totalCustomersCount: { type: Number },
  validCustomersCount: { type: Number },
  createdBy: { type: String, label: 'Created user id', required: true },
  runCount: { type: Number, default: 0 },
});
