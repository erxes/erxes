import {
  APIBaseMessage,
  APIMessage,
  APIUserWithMember,
  GatewayMessagePollVoteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  Snowflake,
} from 'discord-api-types/v10';

type TDiscordReferencedMessage = Partial<
  Pick<
    APIMessage,
    'id' | 'author' | 'content' | 'mentions' | 'attachments' | 'embeds'
  >
>;

type TDiscordMessageSnapshot = {
  message?: Partial<
    Pick<
      APIMessage,
      | 'type'
      | 'content'
      | 'attachments'
      | 'embeds'
      | 'mentions'
      | 'sticker_items'
      | 'timestamp'
      | 'edited_timestamp'
      | 'flags'
    >
  >;
};

export type TDiscordMessagePayload = Partial<
  Omit<APIBaseMessage, 'mentions' | 'referenced_message'>
> & {
  guild_id?: Snowflake;
  mentions?: APIUserWithMember[];
  referenced_message?: TDiscordReferencedMessage | null;
  message_snapshots?: TDiscordMessageSnapshot[];
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
  width?: number;
  height?: number;
  duration?: number;
  waveform?: string;
  ephemeral?: boolean;
  spoiler?: boolean;
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
  forwardedSnapshot?: {
    content?: string;
    attachments?: DiscordAttachment[];
    embeds?: DiscordEmbed[];
    stickers?: DiscordSticker[];
    createdAt?: string;
  };
  replyTo?: {
    messageId: string;
    content?: string;
    authorName?: string;
  };
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

export type DiscordReactionEvent = {
  source: 'discord';
  messageId: string;
  channelId: string;
  userId: string;
  emoji: string;
  added: boolean;
  raw:
    | GatewayMessageReactionAddDispatchData
    | GatewayMessageReactionRemoveDispatchData;
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
