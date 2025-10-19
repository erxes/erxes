import { z } from 'zod';
import { CHANNEL_SCHEMA } from './schema/channel';
import { IUser } from 'ui-modules';
import { CHANNEL_MEMBER_FORM_SCHEMA } from '@/channels/schema/member';

export enum ChannelHotKeyScope {
  ChannelAddSheet = 'frontline-channel-add-sheet',
  ChannelSettingsPage = 'frontline-channel-settings-page',
}

export interface IChannel {
  _id: string;
  icon: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

export interface IChannelMember {
  _id: string;
  memberId: string;
  channelId: string;

  member: IUser;
  role: string;
}

export type TChannelForm = z.infer<typeof CHANNEL_SCHEMA>;

export type TChannelMemberForm = z.infer<typeof CHANNEL_MEMBER_FORM_SCHEMA>;

export interface IPipeline {
  _id: string;
  channelId: string;
  createdAt: string;
  description: string;
  name: string;
  updatedAt: string;
  userId: string;
}

export interface ITicketsPipelineFilter {
  channelId: string;
  cursor?: string;
  aggregationPipeline?: JSON;
  cursorMode?: 'inclusive' | 'exclusive';
  direction?: 'forward' | 'backward';
  limit?: number;
  name?: string;
  orderBy?: JSON;
  sort?: string;
  userId?: string;
}