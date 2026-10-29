import { Document } from 'mongoose';
import { TDiscordNotificationEvent } from '@/discordIntegration/@types/discordNotification';

export type IDiscordConfig = {
  teamId: string;
  connectionId: string;
  channelId: string;
  channelName: string;
  events: TDiscordNotificationEvent[];
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
