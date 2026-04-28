import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';

export const commentConversationReplySchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    mid: { type: String, label: 'comment message id' },
    comment_id: { type: String },
    parentId: String,
    recipientId: { type: String },
    senderId: { type: String },
    content: String,
    customerId: { type: String, optional: true },
    userId: { type: String, optional: true },
    createdAt: { type: Date, default: Date.now, label: 'Created At' },
    updatedAt: { type: Date, index: true, label: 'Updated At' },
    attachments: [attachmentSchema],
    isResolved: { type: Boolean, default: false },
  }),
);
