import { Document } from 'mongoose';

export type IDiscordCustomerChannel = {
  connectionId: string;
  guildId: string;
  channelId: string;
  channelName: string;
  companyId: string;
  teamId: string;
  createdBy?: string;
  subdomain: string;
};

export interface IDiscordCustomerChannelDocument
  extends IDiscordCustomerChannel,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
