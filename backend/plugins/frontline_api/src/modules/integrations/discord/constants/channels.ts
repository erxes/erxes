import { ChannelType } from 'discord-api-types/v10';

export const ROUTABLE_CHANNEL_TYPES = new Set<ChannelType>([
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
]);

export const MEMBER_SEARCH_LIMIT = 1000;

export const MEMBER_QUERY_MAX_LENGTH = 100;
