import { useLazyQuery, useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DISCORD_BOT_CHANNELS,
  DISCORD_BOTS,
  DISCORD_CHANNEL_MEMBERS,
  DISCORD_CONNECTED_SERVERS,
  DISCORD_CONVERSATION_CHANNEL,
  DISCORD_CONVERSATION_CHANNELS,
  DISCORD_CONVERSATION_PARTICIPANTS,
  DISCORD_GUILD_CHANNELS,
  DISCORD_GUILDS,
  DISCORD_NAME_PRESETS,
  DISCORD_SERVERS,
  DISCORD_TAKEN_CHANNELS,
  DISCORD_VALIDATE_TOKEN,
} from '../graphql/queries';

export type DiscordTokenValidation = {
  valid: boolean;
  botId?: string;
  botUsername?: string;
  applicationId?: string;
  hasMessageContentIntent?: boolean;
  hasServerMembersIntent?: boolean;
  error?: string;
};

export type DiscordGuild = { id: string; name?: string; icon?: string };
export type DiscordChannel = {
  id: string;
  name?: string;
  type?: number;
  parentName?: string;
};

export const useDiscordValidateToken = () => {
  const [validate, { data, loading }] = useLazyQuery<{
    discordValidateToken: DiscordTokenValidation;
  }>(DISCORD_VALIDATE_TOKEN, { fetchPolicy: 'network-only' });

  return {
    validate: (token: string) => validate({ variables: { token } }),
    validation: data?.discordValidateToken,
    loading,
  };
};

export const useDiscordGuilds = (token: string, skip: boolean) => {
  const { data, loading } = useQuery<{ discordGuilds: DiscordGuild[] }>(
    DISCORD_GUILDS,
    { variables: { token }, skip, fetchPolicy: 'network-only' },
  );

  return { guilds: data?.discordGuilds ?? [], loading };
};

export const useDiscordGuildChannels = (
  token: string,
  guildId: string,
  skip: boolean,
) => {
  const { data, loading } = useQuery<{
    discordGuildChannels: DiscordChannel[];
  }>(DISCORD_GUILD_CHANNELS, {
    variables: { token, guildId },
    skip,
    fetchPolicy: 'network-only',
  });

  return { channels: data?.discordGuildChannels ?? [], loading };
};

export type DiscordBotOption = {
  _id: string;
  name?: string;
  guildId?: string;
  channelId?: string;
};

export const useDiscordBots = () => {
  const { data, loading } = useQuery<{ discordBots: DiscordBotOption[] }>(
    DISCORD_BOTS,
  );

  return { bots: data?.discordBots ?? [], loading };
};

export type DiscordConnectedServer = {
  guildId: string;
  guildName?: string;
  botId: string;
};

export const useDiscordConnectedServers = (channelId?: string) => {
  const { data, loading } = useQuery<{
    discordConnectedServers: DiscordConnectedServer[];
  }>(DISCORD_CONNECTED_SERVERS, {
    variables: { channelId: channelId as string },
    skip: !channelId,
  });

  return { connectedServers: data?.discordConnectedServers ?? [], loading };
};

export const useDiscordTakenChannels = (channelId?: string) => {
  const { data, loading } = useQuery<{ discordTakenChannels: string[] }>(
    DISCORD_TAKEN_CHANNELS,
    { variables: { channelId: channelId as string }, skip: !channelId },
  );

  return { takenChannelIds: data?.discordTakenChannels ?? [], loading };
};

export const useDiscordNamePresets = (channelId?: string) => {
  const { data, loading, refetch } = useQuery<{ discordNamePresets: string[] }>(
    DISCORD_NAME_PRESETS,
    {
      variables: { channelId: channelId as string },
      skip: !channelId,
      fetchPolicy: 'cache-and-network',
    },
  );

  return { namePresets: data?.discordNamePresets ?? [], loading, refetch };
};

export const useDiscordBotChannels = (botId: string, skip: boolean) => {
  const { data, loading } = useQuery<{ discordBotChannels: DiscordChannel[] }>(
    DISCORD_BOT_CHANNELS,
    { variables: { botId }, skip: skip || !botId, fetchPolicy: 'network-only' },
  );

  return { channels: data?.discordBotChannels ?? [], loading };
};

export type DiscordServer = {
  guildId: string;
  name?: string;
  integrationIds: string[];
};

export const useDiscordServers = () => {
  const { data, loading } = useQuery<{ discordServers: DiscordServer[] }>(
    DISCORD_SERVERS,
    { fetchPolicy: 'cache-and-network' },
  );

  return { servers: data?.discordServers ?? [], loading };
};

export type DiscordConversationChannel = {
  conversationId?: string;
  channelId?: string;
  channelName?: string;
  guildId?: string;
  isThread?: boolean;
  parentChannelName?: string;
};

export const useDiscordConversationChannel = (
  conversationId: string,
  skip: boolean,
) => {
  const { data, loading } = useQuery<{
    discordConversationChannel: DiscordConversationChannel | null;
  }>(DISCORD_CONVERSATION_CHANNEL, {
    variables: { conversationId },
    skip,
  });

  return {
    channel: data?.discordConversationChannel ?? undefined,
    loading: loading && !skip,
  };
};

export const useDiscordConversationChannels = (conversationIds: string[]) => {
  const { data, previousData, loading } = useQuery<{
    discordConversationChannels: DiscordConversationChannel[];
  }>(DISCORD_CONVERSATION_CHANNELS, {
    variables: { conversationIds },
    skip: conversationIds.length === 0,
  });

  const resolved = data ?? previousData;

  const channelMap = useMemo(() => {
    const map = new Map<string, DiscordConversationChannel>();
    for (const item of resolved?.discordConversationChannels ?? []) {
      if (item.conversationId) {
        map.set(item.conversationId, item);
      }
    }
    return map;
  }, [resolved]);

  return { channelMap, loading };
};

export type DiscordParticipant = {
  customerId?: string;
  userId: string;
  name?: string;
  avatar?: string;
};

export const useDiscordConversationParticipants = (
  conversationId: string,
  skip: boolean,
) => {
  const { data } = useQuery<{
    discordConversationParticipants: DiscordParticipant[];
  }>(DISCORD_CONVERSATION_PARTICIPANTS, {
    variables: { conversationId },
    skip,
  });

  return data?.discordConversationParticipants ?? [];
};

export type DiscordMemberStatus = 'OK' | 'FORBIDDEN' | 'TRUNCATED' | 'ERROR';

export type DiscordChannelMembersResult = {
  members: DiscordParticipant[];
  status: DiscordMemberStatus;
  truncated: boolean;
};

const findCachedPrefix = (
  cache: Map<string, DiscordChannelMembersResult>,
  query: string,
): DiscordChannelMembersResult | null => {
  for (let length = query.length; length > 0; length--) {
    const entry = cache.get(query.slice(0, length));

    if (entry && !entry.truncated) {
      return entry;
    }
  }

  return null;
};

export const useDiscordChannelMemberSearch = (
  conversationId: string,
  skip: boolean,
) => {
  const [fetchMembers] = useLazyQuery<{
    discordChannelMembers: DiscordChannelMembersResult;
  }>(DISCORD_CHANNEL_MEMBERS, { fetchPolicy: 'network-only' });

  const cacheRef = useRef(new Map<string, DiscordChannelMembersResult>());
  const [status, setStatus] = useState<DiscordMemberStatus>('OK');

  useEffect(() => {
    cacheRef.current.clear();
    setStatus('OK');
  }, [conversationId]);

  const search = useCallback(
    async (rawQuery: string): Promise<DiscordParticipant[]> => {
      const query = rawQuery.trim();

      if (skip || !query) {
        return [];
      }

      const lowered = query.toLowerCase();
      let result = findCachedPrefix(cacheRef.current, lowered);

      if (!result) {
        const previous = cacheRef.current.get(lowered.slice(0, 1));
        const probe = previous?.truncated ? query : query.slice(0, 1);

        const { data } = await fetchMembers({
          variables: { conversationId, query: probe },
        });

        result = data?.discordChannelMembers ?? {
          members: [],
          status: 'ERROR',
          truncated: false,
        };

        cacheRef.current.set(probe.toLowerCase(), result);
      }

      const resolved = result;

      setStatus((prev) => (prev === resolved.status ? prev : resolved.status));

      return resolved.members.filter((member) =>
        (member.name || '').toLowerCase().includes(lowered),
      );
    },
    [conversationId, fetchMembers, skip],
  );

  return { search, status };
};
