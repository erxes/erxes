import {
  APIBaseMessage,
  APIMessage,
  APIUserWithMember,
  GatewayMessagePollVoteDispatchData,
  Snowflake,
} from 'discord-api-types/v10';
import type { IMessageReplyTo } from '@/inbox/@types/conversationMessages';

type TDiscordReferencedMessage = Partial<
  Pick<
    APIMessage,
    'id' | 'author' | 'content' | 'mentions' | 'attachments' | 'embeds'
  >
>;

export type TDiscordMessagePayload = Partial<
  Omit<APIBaseMessage, 'mentions' | 'referenced_message'>
> & {
  guild_id?: Snowflake;
  mentions?: APIUserWithMember[];
  referenced_message?: TDiscordReferencedMessage | null;
};

export type DiscordMention = {
  id: string;
  name: string;
};

export type DiscordPoll = {
  question: string;
  answers: { id: number; text: string; emoji?: string }[];
  allowMultiselect: boolean;
  expiry?: string;
  results?: {
    isFinalized: boolean;
    answerCounts: { id: number; count: number }[];
  };
};

export type DiscordEmbed = {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  author?: { name?: string; url?: string; iconUrl?: string };
  provider?: { name?: string; url?: string };
  thumbnail?: { url?: string; width?: number; height?: number };
  image?: { url?: string; width?: number; height?: number };
  video?: { url?: string; width?: number; height?: number };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text?: string; iconUrl?: string };
  timestamp?: string;
};

export type DiscordAttachment = {
  type: string;
  url: string;
  name?: string;
  size?: number;
  duration?: number;
};

export type DiscordSticker = {
  id: string;
  name: string;
  formatType: number;
  url?: string;
};

export type DiscordActivity = {
  source: 'discord';
  timestamp: Date;
  messageId: string;
  channelId: string;
  guildId?: string;
  author: {
    id: string;
    username: string;
    bot: boolean;
  };
  content: string;
  type?: number;
  mentions: DiscordMention[];
  poll?: DiscordPoll;
  embeds?: DiscordEmbed[];
  attachments: DiscordAttachment[];
  stickers?: DiscordSticker[];
  voiceMessage?: boolean;
  replyTo?: IMessageReplyTo;
  raw: TDiscordMessagePayload;
};

export type DiscordPollVoteEvent = {
  source: 'discord';
  messageId: string;
  channelId: string;
  guildId?: string;
  userId: string;
  answerId: number;
  added: boolean;
  raw: GatewayMessagePollVoteDispatchData;
};

export type DiscordMessageDeleteEvent = {
  source: 'discord';
  messageIds: string[];
  channelId: string;
  guildId?: string;
};

export type DiscordTypingEvent = {
  source: 'discord';
  channelId: string;
  guildId?: string;
  userId: string;
  username?: string;
  bot: boolean;
  timestamp: Date;
};
