import { z } from 'zod';
import { CHANNEL_SCHEMA } from '../schema/channel';
import { IUser } from 'ui-modules';
import { CHANNEL_MEMBER_FORM_SCHEMA } from '@/channels/schema/member';

export enum ChannelHotKeyScope {
  ChannelAddSheet = 'frontline-channel-add-sheet',
  ChannelSettingsPage = 'frontline-channel-settings-page',
  ChannelDetailPage = 'frontline-channel-detail-page',
  ChannelMembersPage = 'frontline-channel-members-page',
  ChannelAddMemberSheet = 'frontline-channel-add-member-sheet',
  ChannelIntegrationsPage = 'frontline-channel-integrations-page',
}

export interface IChannel {
  _id: string;
  icon: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  pipelineCount: number;
  responseTemplateCount: number;
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
