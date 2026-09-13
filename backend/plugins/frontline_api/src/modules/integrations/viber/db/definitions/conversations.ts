import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const viberConversationSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true },
  userId: { type: String, required: true },
  conversationId: { type: String, required: true, index: true },
});

viberConversationSchema.index({ inboxId: 1, userId: 1 }, { unique: true });
