import { z } from 'zod';
import { CHANNEL_FORM_SCHEMA } from '../schema/channel';

export type TChannel = {
  _id: string;
  conversationCount: number;
  description: string;
  memberIds: string[];
  name: string;
  openConversationCount: number;
  userId: string;
  integrationIds: string[];
};

export type TChannelForm = z.infer<typeof CHANNEL_FORM_SCHEMA>;

export enum ChannelHotKeyScope {
  ChannelSettingsPage = 'channel-settings-page',
  ChannelAdd = 'channels-add',
}
