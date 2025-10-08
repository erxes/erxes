import { Document } from 'mongoose';
export interface IChannel {
  name?: string;
  icon?: string;
  description?: string;
  userId?: string;
  conversationCount?: number;
  openConversationCount?: number;
}
export interface IChannelsEdit extends IChannel {
  _id: string;
}
export interface IChannelDocument extends IChannel, Document {
  _id: string;
  createdAt: Date;
}

export interface IChannelFilter extends IChannel {
  userId: string;
  channelIds: string[];
  integrationId: string;
}

export enum ChannelMemberRoles {
  ADMIN = 'admin',
  MEMBER = 'member',
  LEAD = 'lead',
}

export interface IChannelMember {
  memberId: string;
  channelId: string;
  role: ChannelMemberRoles;
}

export interface IChannelMemberDocument extends IChannelMember, Document {
  _id: string;
}
