import {
  ChannelType,
  type APIChannel,
  type APIGuild,
  type APIGuildMember,
  type APIRole,
  type APIThreadChannel,
  type ThreadChannelType,
} from 'discord-api-types/v10';

import { discordRequest } from '@/integrations/discord/utils/request';

import { type GuildChannelLike } from '@/integrations/discord/@types/channel';

import {
  ROUTABLE_CHANNEL_TYPES,
  MEMBER_QUERY_MAX_LENGTH,
  MEMBER_SEARCH_LIMIT,
} from '@/integrations/discord/constants/channels';

export const getChannel = (token: string, channelId: string) => {
  return discordRequest<APIChannel>({
    token,
    method: 'GET',
    path: `/channels/${channelId}`,
  });
};

export const getGuild = (token: string, guildId: string) => {
  return discordRequest<APIGuild>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}`,
  });
};

export const isThreadChannel = (
  channel: APIChannel,
): channel is APIThreadChannel<ThreadChannelType> =>
  channel.type === ChannelType.AnnouncementThread ||
  channel.type === ChannelType.PublicThread ||
  channel.type === ChannelType.PrivateThread;

export const listGuildChannels = async (token: string, guildId: string) => {
  const channels = await discordRequest<APIChannel[]>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/channels`,
  });

  const all = (Array.isArray(channels) ? channels : []) as GuildChannelLike[];

  const categories = new Map<string, { name: string; position: number }>();
  for (const c of all) {
    if (c.type === ChannelType.GuildCategory) {
      categories.set(c.id, { name: c.name ?? '', position: c.position ?? 0 });
    }
  }

  return all
    .filter((c) => ROUTABLE_CHANNEL_TYPES.has(c.type))
    .map((c) => {
      const parentId = c.parent_id ?? undefined;
      const category = parentId ? categories.get(parentId) : undefined;
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        position: c.position ?? 0,
        parentId,
        parentName: category?.name,
        parentPosition: category ? category.position : -1,
      };
    })
    .sort(
      (a, b) => a.parentPosition - b.parentPosition || a.position - b.position,
    );
};

export const listActiveThreads = async (
  token: string,
  guildId: string,
): Promise<APIThreadChannel<ThreadChannelType>[]> => {
  const res = await discordRequest<{
    threads: APIThreadChannel<ThreadChannelType>[];
  }>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/threads/active`,
  });

  return Array.isArray(res?.threads) ? res.threads : [];
};

export const getGuildRoles = async (
  token: string,
  guildId: string,
): Promise<APIRole[]> => {
  const roles = await discordRequest<APIRole[]>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/roles`,
  });

  return Array.isArray(roles) ? roles : [];
};

export const normalizeMemberQuery = (query?: string): string =>
  (query || '').trim().slice(0, MEMBER_QUERY_MAX_LENGTH);

export const searchGuildMembers = async (
  token: string,
  guildId: string,
  query: string,
  limit: number = MEMBER_SEARCH_LIMIT,
): Promise<{ members: APIGuildMember[]; truncated: boolean }> => {
  const normalized = normalizeMemberQuery(query);

  if (!normalized) {
    return { members: [], truncated: false };
  }

  const capped = Math.min(Math.max(limit, 1), MEMBER_SEARCH_LIMIT);

  const params = new URLSearchParams({
    query: normalized,
    limit: String(capped),
  });

  const members = await discordRequest<APIGuildMember[]>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/members/search?${params.toString()}`,
  });

  const list = Array.isArray(members) ? members : [];

  return { members: list, truncated: list.length >= capped };
};
