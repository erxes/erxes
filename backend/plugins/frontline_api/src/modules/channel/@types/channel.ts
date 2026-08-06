import { Document } from 'mongoose';

export enum ChannelScopes {
  TEAM = 'team',
  PERSONAL = 'personal',
}

export interface IChannel {
  name?: string;
  icon?: string;
  description?: string;
  memberIds?: string[];
  userId?: string;
  scope?: ChannelScopes;
  conversationCount?: number;
  openConversationCount?: number;
}
export interface IChannelsEdit extends IChannel {
  _id: string;
}
export interface IChannelDocument extends IChannel, Document {
  _id: string;
  createdAt: Date;
  createdBy?: string;
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
