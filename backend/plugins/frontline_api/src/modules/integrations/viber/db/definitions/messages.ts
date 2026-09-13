import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const viberMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true },
  messageToken: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  processedAt: { type: Date },
});

viberMessageSchema.index({ inboxId: 1, messageToken: 1 }, { unique: true });
