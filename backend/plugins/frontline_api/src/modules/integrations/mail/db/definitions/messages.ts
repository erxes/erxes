import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import {
  MAIL_CONVERSATION_STATUSES_ON_SENT,
  MAIL_DELIVERY_STATUSES,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';

const addressSchema = new Schema(
  {
    name: String,
    address: String,
  },
  { _id: false },
);

const attachmentSchema = new Schema(
  {
    filename: String,
    mimeType: String,
    type: String,
    size: Number,
    url: String,
    contentId: String,
    disposition: String,
    error: { type: String, label: 'Why the attachment could not be stored' },
  },
  { _id: false },
);

export const mailMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxIntegrationId: {
    type: String,
    index: true,
    label:
      'Mail integration scope: the inbox id of a channel inbox, the mail integration id of a pipeline address',
  },
  inboxConversationId: {
    type: String,
    index: true,
    sparse: true,
    label: 'Inbox conversation, set only on channel inbox mail',
  },
  ticketId: {
    type: String,
    index: true,
    sparse: true,
    label: 'Ticket this mail thread belongs to, set only on pipeline mail',
  },
  messageId: { type: String },
  subject: String,
  body: String,
  from: [addressSchema],
  to: [addressSchema],
  cc: [addressSchema],
  bcc: [addressSchema],
  attachments: [attachmentSchema],
  inReplyTo: { type: String, index: true },
  references: { type: [String], index: true },
  replyTag: { type: String, index: true, sparse: true },
  isAuto: { type: Boolean, default: false },
  automated: {
    type: Boolean,
    default: false,
    label: 'Sent by an automation without a teammate reviewing it',
  },
  conversationStatusOnSent: {
    type: String,
    enum: Object.values(MAIL_CONVERSATION_STATUSES_ON_SENT),
    label: 'Conversation status applied once this reply is delivered',
  },
  draftId: {
    type: String,
    index: true,
    sparse: true,
    label: 'Reviewed draft this reply was sent from',
  },
  sourceMessageId: {
    type: String,
    label: 'Inbound mail this automatic reply or sent draft answers',
  },
  envelopeFrom: {
    type: String,
    label: 'SMTP envelope sender of an inbound mail',
  },
  senderMismatch: {
    type: Boolean,
    default: false,
    label: 'Whether the envelope sender contradicts the From header',
  },
  providerMessageId: {
    type: String,
    index: true,
    sparse: true,
    label: 'Message id the transport actually sent under',
  },
  deliveryStatus: {
    type: String,
    enum: [...Object.values(MAIL_DELIVERY_STATUSES), null],
    label: 'Outbound delivery outcome',
  },
  deliveryError: { type: String, label: 'Last outbound failure reason' },
  deliveryRetryable: {
    type: Boolean,
    label: 'Whether resending the failed message can succeed',
  },
  bouncedRecipients: { type: [String], default: undefined },
  type: {
    type: String,
    enum: Object.values(MAIL_MESSAGE_TYPES),
  },
  createdAt: { type: Date, index: true, default: () => new Date() },
});

mailMessageSchema.index(
  { inboxIntegrationId: 1, messageId: 1 },
  { unique: true },
);
mailMessageSchema.index(
  { sourceMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      automated: true,
      sourceMessageId: { $type: 'string' },
    },
  },
);
