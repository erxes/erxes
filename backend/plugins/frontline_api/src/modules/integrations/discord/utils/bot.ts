import {
  type APIApplication,
  type APIChannel,
  type APIUser,
  type RESTGetAPICurrentUserGuildsResult,
} from 'discord-api-types/v10';

import { discordRequest } from '@/integrations/discord/utils/request';

import {
  GATEWAY_MESSAGE_CONTENT,
  GATEWAY_MESSAGE_CONTENT_LIMITED,
  GATEWAY_GUILD_MEMBERS,
  GATEWAY_GUILD_MEMBERS_LIMITED,
} from '@/integrations/discord/constants/intents';

export const openDmChannel = (token: string, userId: string) => {
  return discordRequest<APIChannel>({
    token,
    method: 'POST',
    path: '/users/@me/channels',
    body: { recipient_id: userId },
  });
};

export const getCurrentBotUser = (token: string) => {
  return discordRequest<APIUser>({ token, method: 'GET', path: '/users/@me' });
};

export const getDiscordUser = (token: string, userId: string) => {
  return discordRequest<APIUser>({
    token,
    method: 'GET',
    path: `/users/${userId}`,
  });
};

export const hasMessageContentIntent = (flags?: number): boolean =>
  typeof flags === 'number' &&
  (flags & (GATEWAY_MESSAGE_CONTENT | GATEWAY_MESSAGE_CONTENT_LIMITED)) !== 0;

export const hasServerMembersIntent = (flags?: number): boolean =>
  typeof flags === 'number' &&
  (flags & (GATEWAY_GUILD_MEMBERS | GATEWAY_GUILD_MEMBERS_LIMITED)) !== 0;

export const resolveMissingIntents = (flags?: number): string[] => {
  const missing: string[] = [];

  if (!hasMessageContentIntent(flags)) {
    missing.push('MESSAGE_CONTENT');
  }

  if (!hasServerMembersIntent(flags)) {
    missing.push('SERVER_MEMBERS');
  }

  return missing;
};

export const getApplicationInfo = (token: string) => {
  return discordRequest<APIApplication>({
    token,
    method: 'GET',
    path: '/applications/@me',
  });
};

export const listBotGuilds = (token: string) => {
  return discordRequest<RESTGetAPICurrentUserGuildsResult>({
    token,
    method: 'GET',
    path: '/users/@me/guilds',
  });
};
