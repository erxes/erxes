import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const conversationSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    erxesApiId: String,
    timestamp: Date,
    senderId: { type: String, index: true },
    recipientId: { type: String, index: true },
    integrationId: String,
    content: String,
    isBot: Boolean,
    botId: { type: String, optional: true },
  }),
);

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
