import { Document } from 'mongoose';
import { TDiscordNotificationEvent } from '@/discordIntegration/@types/discordNotification';
import { DISCORD_MENTION_TARGETS } from '@/discordIntegration/constants';

export type TDiscordMentionTarget = (typeof DISCORD_MENTION_TARGETS)[number];

export type TDiscordChannelMention = Exclude<TDiscordMentionTarget, 'none'>;

export type IDiscordConfig = {
  teamId: string;
  connectionId: string;
  channelId: string;
  channelName: string;
  events: TDiscordNotificationEvent[];
  mention?: TDiscordMentionTarget;
  mentionEvents?: TDiscordNotificationEvent[];
  isActive: boolean;
  lastError?: string | null;
  lastSentAt?: Date | null;
  subdomain: string;
};

export interface IDiscordConfigDocument extends IDiscordConfig, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
