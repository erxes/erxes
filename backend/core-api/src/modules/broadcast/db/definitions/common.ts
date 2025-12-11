import { MESSENGER_KINDS, SENT_AS_CHOICES } from '@/broadcast/constants';
import { ruleSchema } from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';

export const scheduleDateSchema = new Schema(
  {
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
  },
  {
    _id: false,
  },
);

export const emailSchema = new Schema(
  {
    attachments: { type: Object, label: 'Attachments' },
    subject: { type: String, label: 'Subject', required: true },
    sender: { type: String, label: 'Sender' },
    replyTo: { type: String, label: 'Reply to' },
    content: { type: String, label: 'Content', required: true },
    templateId: { type: String, label: 'Template' },
  },
  {
    _id: false,
  },
);

export const messengerSchema = new Schema(
  {
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
  },
  {
    _id: false,
  },
);

export const smsSchema = new Schema(
  {
    from: { type: String, label: 'From text' },
    content: { type: String, label: 'SMS content', required: true },
    fromIntegrationId: {
      type: String,
      label: 'Configured integration',
      required: true,
    },
  },
  {
    _id: false,
  },
);

export const notificationSchema = new Schema(
  {
    title: { type: String, label: 'Title', required: true },
    content: { type: String, label: 'Notification content', required: true },
    isMobile: { type: Boolean, label: 'Is mobile', required: true },
  },
  {
    _id: false,
  },
);
