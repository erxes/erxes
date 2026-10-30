import { Document } from 'mongoose';

export type TDiscordHealthStatus = 'healthy' | 'broken';

export type IDiscordConnectionHealth = {
  status: TDiscordHealthStatus;
  lastVerifiedAt?: Date;
  lastError?: string | null;
};

export type IDiscordConnection = {
  guildId: string;
  guildName: string;
  guildIconUrl?: string | null;
  applicationId: string;
  botUserId: string;
  botUsername: string;
  token: string;
  clientSecret?: string;
  hasClientSecret?: boolean;
  publicKey?: string;
  commandsRegisteredAt?: Date;
  commandsVersion?: string;
  commandsError?: string | null;
  health: IDiscordConnectionHealth;
  createdBy?: string;
  subdomain: string;
};

export interface IDiscordConnectionDocument
  extends IDiscordConnection,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
