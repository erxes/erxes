import type {
  FrontlineChannelListQuery,
  GetChannelMembersQuery,
  GetChannelQuery,
  GetMyChannelsQuery,
  GetPersonalChannelQuery,
} from '~/gql/graphql';
import { z } from 'zod';
import { CHANNEL_SCHEMA } from '../schema/channel';
import { CHANNEL_MEMBER_FORM_SCHEMA } from '@/channels/schema/member';

export enum ChannelHotKeyScope {
  ChannelAddSheet = 'frontline-channel-add-sheet',
  ChannelSettingsPage = 'frontline-channel-settings-page',
  ChannelDetailPage = 'frontline-channel-detail-page',
  ChannelMembersPage = 'frontline-channel-members-page',
  ChannelAddMemberSheet = 'frontline-channel-add-member-sheet',
  ChannelIntegrationsPage = 'frontline-channel-integrations-page',
}

export enum ChannelScope {
  TEAM = 'team',
  PERSONAL = 'personal',
}

export type IChannel = NonNullable<
  NonNullable<FrontlineChannelListQuery['getChannels']>[number]
>;

export type IMyChannel = NonNullable<
  NonNullable<GetMyChannelsQuery['getMyChannels']>[number]
>;

export type IChannelDetail = NonNullable<GetChannelQuery['getChannel']>;

export type IPersonalChannel = NonNullable<
  GetPersonalChannelQuery['getPersonalChannel']
>;

export enum ChannelResourceType {
  INTEGRATION = 'integration',
  PIPELINE = 'pipeline',
  FORM = 'form',
  SURVEY = 'survey',
  RESPONSE_TEMPLATE = 'responseTemplate',
}

export type IChannelMember = NonNullable<
  NonNullable<GetChannelMembersQuery['getChannelMembers']>[number]
>;

export type TChannelForm = z.infer<typeof CHANNEL_SCHEMA>;

export type TChannelMemberForm = z.infer<typeof CHANNEL_MEMBER_FORM_SCHEMA>;
