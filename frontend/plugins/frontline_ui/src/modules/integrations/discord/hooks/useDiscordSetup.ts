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

// Lazy so validation only fires once the user has finished pasting a token
// (the wizard triggers it explicitly), never on every keystroke.
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

/** Fetch the guilds (servers) a bot token can access. */
export const useDiscordGuilds = (token: string, skip: boolean) => {
  const { data, loading } = useQuery<{ discordGuilds: DiscordGuild[] }>(
    DISCORD_GUILDS,
    { variables: { token }, skip, fetchPolicy: 'network-only' },
  );

  return { guilds: data?.discordGuilds ?? [], loading };
};

/** Fetch the text channels of a guild for the given bot token. */
export const useDiscordGuildChannels = (
  token: string,
  guildId: string,
  skip: boolean,
) => {
  const { data, loading } = useQuery<{ discordGuildChannels: DiscordChannel[] }>(
    DISCORD_GUILD_CHANNELS,
    { variables: { token, guildId }, skip, fetchPolicy: 'network-only' },
  );

  return { channels: data?.discordGuildChannels ?? [], loading };
};

export type DiscordBotOption = {
  _id: string;
  name?: string;
  guildId?: string;
  channelId?: string;
};

// Connected bots for the automation action's bot picker.
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

// Discord servers already connected to a given inbox channel — feeds the
// wizard's "add channels to a connected server" picker. Scoped server-side to
// the inbox channel, so it never loads every bot in the system. Skipped until
// the channel id is known.
export const useDiscordConnectedServers = (channelId?: string) => {
  const { data, loading } = useQuery<{
    discordConnectedServers: DiscordConnectedServer[];
  }>(DISCORD_CONNECTED_SERVERS, {
    variables: { channelId: channelId as string },
    skip: !channelId,
  });

  return { connectedServers: data?.discordConnectedServers ?? [], loading };
};

// The Discord channel ids already routed to a given inbox channel — feeds the
// wizard's picker filter so a channel can't be added here twice. Scoped
// server-side, so it replaces paging every integration on the channel.
export const useDiscordTakenChannels = (channelId?: string) => {
  const { data, loading } = useQuery<{ discordTakenChannels: string[] }>(
    DISCORD_TAKEN_CHANNELS,
    { variables: { channelId: channelId as string }, skip: !channelId },
  );

  return { takenChannelIds: data?.discordTakenChannels ?? [], loading };
};

// Channels of a chosen bot for the action's channel picker. Skipped until a bot
// is selected so it costs nothing otherwise.
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

// Connected Discord servers with their integration ids, for the sidebar's
// server-grouped channel list. cache-and-network for the same reason as the
// integrations list there: the sidebar unmounts on the Settings route, so
// adds/removes must reflect when returning to the inbox.
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

// Resolves which Discord channel an inbox conversation came from. Skipped for
// non-Discord conversations so it costs nothing elsewhere in the inbox.
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

// Batch-resolves thread/channel metadata for a set of conversations, returned as
// a Map keyed by conversation id, so the inbox list can nest threads under their
// parent channel. Skipped when there are no Discord conversation ids to resolve.
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

// The Discord users who have chatted in a conversation, for @-mentioning them
// in an agent reply. Skipped for non-Discord conversations.
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
