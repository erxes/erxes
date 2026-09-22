import { HydratedDocument } from 'mongoose';

export interface IDiscordConversation {
  _id: string;
  // Conversation id on the inbox (core) side
  erxesApiId?: string;
  timestamp: Date;
  // Discord channel the conversation lives in — the grouping identity (one
  // conversation per channel; a thread has its own id, so it's its own row).
  channelId: string;
  // Human channel name (e.g. 'general'), resolved from `channelId` for display
  channelName?: string;
  // True when `channelId` is a Discord thread (vs a top-level channel).
  isThread?: boolean;
  // Parent channel of the thread, for nesting/labeling in the inbox.
  parentChannelId?: string;
  parentChannelName?: string;
  // The author who opened the conversation (first speaker); informational only.
  authorId: string;
  // Guild (server) the channel belongs to, if any
  guildId?: string;
  content: string;
  integrationId: string;
}

export type IDiscordConversationDocument =
  HydratedDocument<IDiscordConversation>;
