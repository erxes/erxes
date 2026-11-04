import { Document } from 'mongoose';
import {
  TDiscordCardEvent,
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
  lastEvent: TDiscordCardEvent;
  audience?: TDiscordNotificationTarget;
  discordUserId?: string;
};

export interface IDiscordMessageDocument extends IDiscordMessage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
