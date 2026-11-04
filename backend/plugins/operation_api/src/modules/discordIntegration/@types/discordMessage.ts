import { Document } from 'mongoose';
import {
  TDiscordNotificationEvent,
  TDiscordNotificationTarget,
} from '@/discordIntegration/@types/discordNotification';

export type TDiscordCardKey = {
  entityId: string;
  channelId: string;
  subdomain: string;
};

export type IDiscordMessage = TDiscordCardKey & {
  messageId: string;
  configId: string;
  lastEvent: TDiscordNotificationEvent;
  audience?: TDiscordNotificationTarget;
  discordUserId?: string;
};

export interface IDiscordMessageDocument extends IDiscordMessage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
