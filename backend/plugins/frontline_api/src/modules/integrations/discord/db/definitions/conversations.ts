import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const conversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: String,
  timestamp: Date,
  // One inbox conversation per Discord channel. `channelId` is the grouping
  // identity — a thread has its own id, so it becomes its own conversation —
  // and is unique to guard against concurrent duplicate creates for the channel.
  channelId: { type: String, unique: true },
  // Human channel name (e.g. 'general') resolved from `channelId`, surfaced in
  // the inbox so agents see which Discord channel a conversation came from.
  channelName: { type: String },
  // Thread metadata. A Discord thread routes to its parent channel's
  // integration but keeps its own `channelId`; these let the inbox nest the
  // conversation under its parent channel and label it with the thread name.
  isThread: { type: Boolean, default: false },
  parentChannelId: { type: String },
  parentChannelName: { type: String },
  // The author who opened the conversation (first speaker); informational only.
  authorId: { type: String },
  guildId: { type: String },
  integrationId: String,
  content: String,
});
