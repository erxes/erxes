import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const providerDataSchema = new Schema(
  {
    messageId: { type: String, optional: true },
    attachmentType: { type: String, optional: true },
    fallbackReason: { type: String, optional: true },
    previewText: { type: String, optional: true },
    previewUrl: { type: String, optional: true },
    shareType: { type: String, optional: true },
    storyUrl: { type: String, optional: true },
  },
  { _id: false },
);

const replyToSchema = new Schema(
  {
    messageId: { type: String, required: true },
    content: { type: String, optional: true },
    authorName: { type: String, optional: true },
  },
  { _id: false },
);

export const conversationMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  mid: { type: String, label: 'Facebook message id' },
  content: { type: String },
  // the following derives from inbox
  attachments: [attachmentSchema],
  conversationId: { type: String, index: true },
  customerId: { type: String, index: true },
  visitorId: {
    type: String,
    index: true,
    label: 'unique visitor id on logger database',
  },
  fromBot: { type: Boolean },
  userId: { type: String, index: true },
  createdAt: { type: Date, index: true, label: 'Created At' },
  updatedAt: { type: Date, index: true, label: 'Updated At' },
  isCustomerRead: { type: Boolean, label: 'Is Customer Read' },
  internal: { type: Boolean, label: 'Internal' },
  botId: { type: String, label: 'Bot', optional: true },
  botData: { type: Object, optional: true },
  source: { type: Object, optional: true },
  messageKind: { type: String, optional: true },
  providerData: { type: providerDataSchema, optional: true },
  replyTo: { type: replyToSchema, optional: true },
  expiresAt: { type: Date, optional: true },
});
