import { gql } from '@apollo/client';

export const DISCORD_VALIDATE_TOKEN = gql`
  query DiscordValidateToken($token: String!) {
    discordValidateToken(token: $token) {
      valid
      botId
      botUsername
      applicationId
      hasMessageContentIntent
      error
    }
  }
`;

export const DISCORD_GUILDS = gql`
  query DiscordGuilds($token: String!) {
    discordGuilds(token: $token) {
      id
      name
      icon
    }
  }
`;

export const DISCORD_GUILD_CHANNELS = gql`
  query DiscordGuildChannels($token: String!, $guildId: String!) {
    discordGuildChannels(token: $token, guildId: $guildId) {
      id
      name
      type
      parentName
    }
  }
`;

export const DISCORD_BOTS = gql`
  query DiscordBots {
    discordBots {
      _id
      name
      guildId
      channelId
    }
  }
`;

export const DISCORD_CONNECTED_SERVERS = gql`
  query DiscordConnectedServers($channelId: String!) {
    discordConnectedServers(channelId: $channelId) {
      guildId
      guildName
      botId
    }
  }
`;

export const DISCORD_TAKEN_CHANNELS = gql`
  query DiscordTakenChannels($channelId: String!) {
    discordTakenChannels(channelId: $channelId)
  }
`;

export const DISCORD_BOT_CHANNELS = gql`
  query DiscordBotChannels($botId: String!) {
    discordBotChannels(botId: $botId) {
      id
      name
      type
      parentName
    }
  }
`;

export const DISCORD_SERVERS = gql`
  query DiscordServers {
    discordServers {
      guildId
      name
      integrationIds
    }
  }
`;

export const DISCORD_CONVERSATION_CHANNEL = gql`
  query DiscordConversationChannel($conversationId: String!) {
    discordConversationChannel(conversationId: $conversationId) {
      channelId
      channelName
      guildId
      isThread
      parentChannelName
    }
  }
`;

export const DISCORD_CONVERSATION_PARTICIPANTS = gql`
  query DiscordConversationParticipants($conversationId: String!) {
    discordConversationParticipants(conversationId: $conversationId) {
      customerId
      userId
      name
      avatar
    }
  }
`;

export const DISCORD_CONVERSATION_CHANNELS = gql`
  query DiscordConversationChannels($conversationIds: [String!]!) {
    discordConversationChannels(conversationIds: $conversationIds) {
      conversationId
      channelName
      isThread
      parentChannelName
    }
  }
`;
