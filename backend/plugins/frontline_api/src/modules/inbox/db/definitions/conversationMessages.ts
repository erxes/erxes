import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { MESSAGE_TYPES } from '@/inbox/db/definitions/constants';
const engageDataRuleSchema = new Schema(
  {
    kind: { type: String },
    text: { type: String },
    condition: { type: String },
    value: { type: String, optional: true },
  },
  { _id: false },
);

export const engageDataSchema = new Schema(
  {
    engageKind: { type: String },
    messageId: { type: String },
    brandId: { type: String },
    content: { type: String },
    fromUserId: { type: String },
    kind: { type: String },
    sentAs: { type: String },
    rules: { type: [engageDataRuleSchema], optional: true },
  },
  { _id: false },
);

export const messageSchema = new Schema({
  _id: mongooseStringRandomId,
  content: { type: String, optional: true },
  attachments: [attachmentSchema],
  mentionedUserIds: { type: [String] },
  conversationId: { type: String, index: true },
  internal: { type: Boolean, index: true },
  customerId: { type: String, index: true },
  visitorId: {
    type: String,
    index: true,
    label: 'unique visitor id on logger database',
  },
  fromBot: { type: Boolean },
  getStarted: { type: Boolean },
  userId: { type: String, index: true },
  createdAt: { type: Date, index: true },
  isCustomerRead: { type: Boolean },
  botData: { type: Object },
  formWidgetData: { type: Object },
  messengerAppData: { type: Object },
  engageData: { type: engageDataSchema },
  contentType: {
    type: String,
    enum: MESSAGE_TYPES.ALL,
    default: MESSAGE_TYPES.TEXT,
  },
  botId: { type: String },
});
