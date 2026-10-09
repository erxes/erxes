import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const telegramReactionSchema = new Schema({
  _id: mongooseStringRandomId,
  integrationId: { type: String, required: true },
  chatId: { type: String, required: true },
  messageId: { type: String, required: true },
  actorId: { type: String, required: true },
  date: { type: Number, required: true },
  updateId: { type: Number, required: true },
  reactions: [{ _id: false, key: String, label: String, count: Number }],
});
telegramReactionSchema.index(
  { integrationId: 1, chatId: 1, messageId: 1, actorId: 1 },
  { unique: true },
);

/** Exposes the schema whose unique actor key deduplicates reaction updates. */
export const loadTelegramReactionClass = (): Schema => telegramReactionSchema;
