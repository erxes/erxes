import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const telegramBotSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    botId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    botUsername: {
      type: String,
    },
    botName: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      select: false,
    },
    webhookSecret: {
      type: String,
      required: true,
      select: false,
    },
    canJoinGroups: { type: Boolean },
    canReadAllGroupMessages: { type: Boolean },
    lastVerifiedAt: { type: Date, required: true },
    createdBy: { type: String, required: true, immutable: true },
  },
  { timestamps: true },
);
