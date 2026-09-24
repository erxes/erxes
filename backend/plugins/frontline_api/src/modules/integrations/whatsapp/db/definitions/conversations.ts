import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const conversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: { type: String },
  timestamp: { type: Date },
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true },
  integrationId: { type: String },
  content: { type: String },
});

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
