import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const conversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: { type: String, index: true },
  timestamp: Date,
  channelId: { type: String, unique: true },
  channelName: { type: String },
  isThread: { type: Boolean, default: false },
  parentChannelId: { type: String },
  parentChannelName: { type: String },
  authorId: { type: String },
  guildId: { type: String },
  integrationId: String,
  content: String,
});
