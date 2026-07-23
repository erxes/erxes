import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const conversationMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  messageId: { type: String, unique: true, sparse: true, label: 'Discord message id' },
  content: { type: String },
  // the following derive from inbox
  attachments: [attachmentSchema],
  conversationId: { type: String, index: true },
  customerId: { type: String, index: true },
  userId: { type: String, index: true },
  createdAt: { type: Date, index: true, label: 'Created At' },
  updatedAt: { type: Date, index: true, label: 'Updated At' },
  internal: { type: Boolean, label: 'Internal' },
  // True for messages sent by an automation / AI agent (vs human agent/customer).
  fromBot: { type: Boolean },
});
