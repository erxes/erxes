import { Schema } from 'mongoose';

import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const conversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: String,
  timestamp: Date,
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true },
  integrationId: String,
  content: String,
  isBot: Boolean,
  botId: { type: String, optional: true },
  // The automation input step waiting for this person's next typed message.
  inputWait: {
    type: {
      executionId: String,
      actionId: String,
      replyConnectId: String,
      expiresAt: Date,
    },
    _id: false,
    optional: true,
  },
});

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
