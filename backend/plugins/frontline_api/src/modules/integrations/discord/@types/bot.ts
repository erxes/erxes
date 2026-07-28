import { Document } from 'mongoose';

export type TDiscordBotHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'broken'
  | 'syncing';

export interface IDiscordBotHealth {
  status: TDiscordBotHealthStatus;
  isTokenValid?: boolean;
  botUsername?: string;
  lastVerifiedAt?: Date;
  lastError?: string;
  backfillPending?: boolean;
}

export interface IDiscordBot {
  name: string;
  applicationId: string;
  token: string;
  guildId?: string;
  guildName?: string;
  channelId?: string;
  description?: string;
  erxesApiId?: string;
  health?: IDiscordBotHealth;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface IDiscordBotDocument extends IDiscordBot, Document {
  _id: string;
}

export type IDiscordBotEditInput = Partial<
  Pick<
    IDiscordBot,
    | 'name'
    | 'applicationId'
    | 'token'
    | 'guildId'
    | 'guildName'
    | 'channelId'
    | 'description'
    | 'erxesApiId'
  >
>;
