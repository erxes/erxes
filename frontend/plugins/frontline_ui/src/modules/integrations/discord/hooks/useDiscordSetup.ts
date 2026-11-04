import { useLazyQuery, useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { compactList } from '@/shared/utils/cursorList';
import type {
  DiscordChannelMembersQuery,
  DiscordConversationChannelsQuery,
  DiscordMemberStatus,
} from '~/gql/graphql';
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

/** Validates a Discord token without reusing a cached provider response. */
export const useDiscordValidateToken = () => {
  const [validate, { data, loading }] = useLazyQuery(DISCORD_VALIDATE_TOKEN, {
    fetchPolicy: 'network-only',
  });

  /** Keeps token validation stable across restored setup renders. */
  const validateToken = useCallback(
    (token: string) => validate({ variables: { token } }),
    [validate],
  );
  return {
    validate: validateToken,
    validation: data?.discordValidateToken,
    loading,
  };
};

/** Loads the servers visible to a validated bot token when the wizard needs them. */
export const useDiscordGuilds = (token: string, skip: boolean) => {
  const { data, loading } = useQuery(DISCORD_GUILDS, {
    variables: { token },
    skip,
    fetchPolicy: 'network-only',
  });

  return { guilds: compactList(data?.discordGuilds), loading };
};

/** Loads the selected server channels while preserving the wizard query guard. */
export const useDiscordGuildChannels = (
  token: string,
  guildId: string,
  skip: boolean,
) => {
  const { data, loading } = useQuery(DISCORD_GUILD_CHANNELS, {
    variables: { token, guildId },
    skip,
    fetchPolicy: 'network-only',
  });

  return { channels: compactList(data?.discordGuildChannels), loading };
};

/** Lists saved Discord bots available to the current workspace. */
export const useDiscordBots = () => {
  const { data, loading } = useQuery(DISCORD_BOTS);

  return { bots: compactList(data?.discordBots), loading };
};

/** Lists connected servers scoped to the selected inbox channel. */
export const useDiscordConnectedServers = (channelId?: string) => {
  const { data, loading } = useQuery(DISCORD_CONNECTED_SERVERS, {
    variables: channelId ? { channelId } : undefined,
    skip: !channelId,
  });

  return {
    connectedServers: compactList(data?.discordConnectedServers),
    loading,
  };
};

/** Lists Discord channel IDs already connected to the selected inbox. */
export const useDiscordTakenChannels = (channelId?: string) => {
  const { data, loading } = useQuery(DISCORD_TAKEN_CHANNELS, {
    variables: channelId ? { channelId } : undefined,
    skip: !channelId,
  });

  return { takenChannelIds: compactList(data?.discordTakenChannels), loading };
};

/** Loads reusable integration names and exposes a refresh after channel creation. */
export const useDiscordNamePresets = (channelId?: string) => {
  const { data, loading, refetch } = useQuery(DISCORD_NAME_PRESETS, {
    variables: channelId ? { channelId } : undefined,
    skip: !channelId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    namePresets: compactList(data?.discordNamePresets),
    loading,
    refetch,
  };
};

/** Loads channels for an existing bot only while channel selection is active. */
export const useDiscordBotChannels = (botId: string, skip: boolean) => {
  const { data, loading } = useQuery(DISCORD_BOT_CHANNELS, {
    variables: { botId },
    skip: skip || !botId,
    fetchPolicy: 'network-only',
  });

  return { channels: compactList(data?.discordBotChannels), loading };
};

/** Loads connected Discord servers with cached results during refresh. */
export const useDiscordServers = () => {
  const { data, loading } = useQuery(DISCORD_SERVERS, {
    fetchPolicy: 'cache-and-network',
  });

  return { servers: compactList(data?.discordServers), loading };
};

export type DiscordConversationChannel = NonNullable<
  NonNullable<
    DiscordConversationChannelsQuery['discordConversationChannels']
  >[number]
>;

/** Resolves the Discord channel associated with a conversation. */
export const useDiscordConversationChannel = (
  conversationId: string,
  skip: boolean,
) => {
  const { data, loading } = useQuery(DISCORD_CONVERSATION_CHANNEL, {
    variables: { conversationId },
    skip,
  });

  return {
    channel: data?.discordConversationChannel ?? undefined,
    loading: loading && !skip,
  };
};

/** Indexes the latest available Discord channel metadata by conversation ID. */
export const useDiscordConversationChannels = (conversationIds: string[]) => {
  const { data, previousData, loading } = useQuery(
    DISCORD_CONVERSATION_CHANNELS,
    {
      variables: { conversationIds },
      skip: conversationIds.length === 0,
    },
  );

  const resolved = data ?? previousData;

  const channelMap = useMemo(() => {
    const map = new Map<string, DiscordConversationChannel>();
    for (const item of compactList(resolved?.discordConversationChannels)) {
      if (item.conversationId) {
        map.set(item.conversationId, item);
      }
    }
    return map;
  }, [resolved]);

  return { channelMap, loading };
};

/** Lists Discord participants for an enabled conversation lookup. */
export const useDiscordConversationParticipants = (
  conversationId: string,
  skip: boolean,
) => {
  const { data } = useQuery(DISCORD_CONVERSATION_PARTICIPANTS, {
    variables: { conversationId },
    skip,
  });

  return compactList(data?.discordConversationParticipants);
};

type DiscordChannelMembersResult = NonNullable<
  DiscordChannelMembersQuery['discordChannelMembers']
>;
type DiscordChannelMember = DiscordChannelMembersResult['members'][number];

/** Reuses the longest complete cached member-search prefix. */
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

/** Searches channel members with cached prefixes and provider status updates. */
export const useDiscordChannelMemberSearch = (
  conversationId: string,
  skip: boolean,
) => {
  const [fetchMembers] = useLazyQuery(DISCORD_CHANNEL_MEMBERS, {
    fetchPolicy: 'network-only',
  });

  const cacheRef = useRef(new Map<string, DiscordChannelMembersResult>());
  const [status, setStatus] = useState<DiscordMemberStatus>('OK');

  useEffect(() => {
    cacheRef.current.clear();
    setStatus('OK');
  }, [conversationId]);

  const search = useCallback(
    async (rawQuery: string): Promise<DiscordChannelMember[]> => {
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
