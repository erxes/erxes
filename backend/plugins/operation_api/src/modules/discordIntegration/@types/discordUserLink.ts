import { Document } from 'mongoose';

export type IDiscordUserLink = {
  userId: string;
  discordUserId: string;
  username: string;
  globalName?: string | null;
  avatarUrl?: string | null;
  linkedAt: Date;
  subdomain: string;
};

export interface IDiscordUserLinkDocument extends IDiscordUserLink, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TDiscordLinkState = {
  subdomain: string;
  userId: string;
  connectionId: string;
};
