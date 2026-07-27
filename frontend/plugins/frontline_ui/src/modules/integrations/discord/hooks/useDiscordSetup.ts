import { useLazyQuery, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  DISCORD_BOT_CHANNELS,
  DISCORD_BOTS,
  DISCORD_CONNECTED_SERVERS,
  DISCORD_CONVERSATION_CHANNEL,
  DISCORD_CONVERSATION_CHANNELS,
  DISCORD_CONVERSATION_PARTICIPANTS,
  DISCORD_GUILD_CHANNELS,
  DISCORD_GUILDS,
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
  const { data } = useQuery<{
    discordConversationChannel: DiscordConversationChannel | null;
  }>(DISCORD_CONVERSATION_CHANNEL, {
    variables: { conversationId },
    skip,
  });

  return data?.discordConversationChannel ?? undefined;
};

export const useDiscordConversationChannels = (conversationIds: string[]) => {
  const { data } = useQuery<{
    discordConversationChannels: DiscordConversationChannel[];
  }>(DISCORD_CONVERSATION_CHANNELS, {
    variables: { conversationIds },
    skip: conversationIds.length === 0,
  });

  return useMemo(() => {
    const map = new Map<string, DiscordConversationChannel>();
    for (const item of data?.discordConversationChannels ?? []) {
      if (item.conversationId) {
        map.set(item.conversationId, item);
      }
    }
    return map;
  }, [data]);
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
