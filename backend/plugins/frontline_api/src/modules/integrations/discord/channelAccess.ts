import {
  APIGuildMember,
  APIOverwrite,
  APIRole,
  APIUser,
  OverwriteType,
  PermissionFlagsBits,
} from 'discord-api-types/v10';
import { redis } from 'erxes-api-shared/utils';
import {
  DiscordApiError,
  getChannel,
  getErrorMessage,
  getGuild,
  getGuildRoles,
  normalizeMemberQuery,
  searchGuildMembers,
} from '@/integrations/discord/utils';
import { debugError } from '@/integrations/discord/debuggers';

const VIEW_CHANNEL = PermissionFlagsBits.ViewChannel;
const ADMINISTRATOR = PermissionFlagsBits.Administrator;

export type DiscordChannelViewer = {
  userId: string;
  name: string;
  avatar?: string;
};

const avatarFor = (user: APIUser): string | undefined =>
  user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : undefined;

const basePermissions = (
  member: APIGuildMember,
  guildId: string,
  rolesById: Map<string, APIRole>,
): bigint => {
  const everyone = rolesById.get(guildId);
  let perms = everyone ? BigInt(everyone.permissions) : BigInt(0);

  for (const roleId of member.roles) {
    const role = rolesById.get(roleId);
    if (role) {
      perms |= BigInt(role.permissions);
    }
  }

  return perms;
};

const effectivePermissions = (
  base: bigint,
  member: APIGuildMember,
  guildId: string,
  overwritesById: Map<string, APIOverwrite>,
): bigint => {
  let perms = base;

  const everyone = overwritesById.get(guildId);
  if (everyone) {
    perms &= ~BigInt(everyone.deny);
    perms |= BigInt(everyone.allow);
  }

  let roleAllow = BigInt(0);
  let roleDeny = BigInt(0);
  for (const roleId of member.roles) {
    const overwrite = overwritesById.get(roleId);
    if (overwrite && overwrite.type === OverwriteType.Role) {
      roleAllow |= BigInt(overwrite.allow);
      roleDeny |= BigInt(overwrite.deny);
    }
  }
  perms &= ~roleDeny;
  perms |= roleAllow;

  const memberOverwrite = member.user
    ? overwritesById.get(member.user.id)
    : undefined;
  if (memberOverwrite && memberOverwrite.type === OverwriteType.Member) {
    perms &= ~BigInt(memberOverwrite.deny);
    perms |= BigInt(memberOverwrite.allow);
  }

  return perms;
};

const canViewChannel = (
  member: APIGuildMember,
  guildId: string,
  ownerId: string | undefined,
  rolesById: Map<string, APIRole>,
  overwritesById: Map<string, APIOverwrite>,
): boolean => {
  if (ownerId && member.user?.id === ownerId) {
    return true;
  }

  const base = basePermissions(member, guildId, rolesById);
  if ((base & ADMINISTRATOR) === ADMINISTRATOR) {
    return true;
  }

  const effective = effectivePermissions(base, member, guildId, overwritesById);
  return (effective & VIEW_CHANNEL) === VIEW_CHANNEL;
};

export const computeChannelViewers = ({
  members,
  roles,
  overwrites,
  ownerId,
  guildId,
}: {
  members: APIGuildMember[];
  roles: APIRole[];
  overwrites: APIOverwrite[];
  ownerId?: string;
  guildId: string;
}): DiscordChannelViewer[] => {
  const rolesById = new Map(roles.map((role) => [role.id, role]));
  const overwritesById = new Map(
    overwrites.map((overwrite) => [overwrite.id, overwrite]),
  );

  const viewers: DiscordChannelViewer[] = [];
  for (const member of members) {
    const user = member.user;
    if (!user || user.bot) {
      continue;
    }

    if (canViewChannel(member, guildId, ownerId, rolesById, overwritesById)) {
      viewers.push({
        userId: user.id,
        name: member.nick || user.global_name || user.username,
        avatar: avatarFor(user),
      });
    }
  }

  return viewers;
};

export type TDiscordMemberStatus = 'OK' | 'FORBIDDEN' | 'TRUNCATED' | 'ERROR';

export type TChannelViewersResult = {
  viewers: DiscordChannelViewer[];
  status: TDiscordMemberStatus;
  truncated: boolean;
};

type TChannelMeta = {
  roles: APIRole[];
  overwrites: APIOverwrite[];
  ownerId?: string;
};

type TMemberSearchResult = {
  members: APIGuildMember[];
  truncated: boolean;
};

const CHANNEL_META_TTL_SECONDS = 300;
const MEMBER_SEARCH_TTL_SECONDS = 60;

const readCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    debugError(`Discord cache read failed for ${key}: ${getErrorMessage(e)}`);
    return null;
  }
};

const writeCache = async (key: string, value: unknown, ttlSeconds: number) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (e) {
    debugError(`Discord cache write failed for ${key}: ${getErrorMessage(e)}`);
  }
};

const channelOverwrites = (channel: unknown): APIOverwrite[] => {
  const overwrites = (channel as { permission_overwrites?: APIOverwrite[] })
    ?.permission_overwrites;
  return Array.isArray(overwrites) ? overwrites : [];
};

const getChannelMeta = async (
  token: string,
  channelId: string,
  guildId: string,
): Promise<TChannelMeta> => {
  const key = `discord:channel-meta:${guildId}:${channelId}`;
  const cached = await readCache<TChannelMeta>(key);

  if (cached) {
    return cached;
  }

  const [channel, guild, roles] = await Promise.all([
    getChannel(token, channelId),
    getGuild(token, guildId),
    getGuildRoles(token, guildId),
  ]);

  const meta: TChannelMeta = {
    roles,
    overwrites: channelOverwrites(channel),
    ownerId: guild?.owner_id,
  };

  await writeCache(key, meta, CHANNEL_META_TTL_SECONDS);

  return meta;
};

const getMemberSearch = async (
  token: string,
  guildId: string,
  query: string,
): Promise<TMemberSearchResult> => {
  const key = `discord:member-search:${guildId}:${query.toLowerCase()}`;
  const cached = await readCache<TMemberSearchResult>(key);

  if (cached) {
    return cached;
  }

  const result = await searchGuildMembers(token, guildId, query);

  await writeCache(key, result, MEMBER_SEARCH_TTL_SECONDS);

  return result;
};

const classifyMemberError = (e: unknown): TDiscordMemberStatus =>
  e instanceof DiscordApiError && e.status === 403 ? 'FORBIDDEN' : 'ERROR';

export const getChannelMemberViewers = async (
  token: string,
  channelId: string,
  guildId: string,
  query: string,
): Promise<TChannelViewersResult> => {
  const normalized = normalizeMemberQuery(query);

  if (!normalized) {
    return { viewers: [], status: 'OK', truncated: false };
  }

  try {
    const [meta, search] = await Promise.all([
      getChannelMeta(token, channelId, guildId),
      getMemberSearch(token, guildId, normalized),
    ]);

    const viewers = computeChannelViewers({
      members: search.members,
      roles: meta.roles,
      overwrites: meta.overwrites,
      ownerId: meta.ownerId,
      guildId,
    });

    return {
      viewers,
      status: search.truncated ? 'TRUNCATED' : 'OK',
      truncated: search.truncated,
    };
  } catch (e) {
    debugError(
      `Failed to resolve Discord channel members for ${channelId}: ${getErrorMessage(
        e,
      )}`,
    );

    return { viewers: [], status: classifyMemberError(e), truncated: false };
  }
};
