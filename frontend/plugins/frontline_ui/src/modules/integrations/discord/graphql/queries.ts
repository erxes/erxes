import { gql } from '@apollo/client';

// Probes a pasted bot token against Discord: confirms it, and returns the
// derived application id plus whether the MESSAGE CONTENT intent is enabled —
// so the wizard can auto-fill those and warn inline.
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

// Servers the bot has been added to — feeds the server picker.
export const DISCORD_GUILDS = gql`
  query DiscordGuilds($token: String!) {
    discordGuilds(token: $token) {
      id
      name
      icon
    }
  }
`;

// Text channels of a guild — feeds the channel multi-select.
export const DISCORD_GUILD_CHANNELS = gql`
  query DiscordGuildChannels($token: String!, $guildId: String!) {
    discordGuildChannels(token: $token, guildId: $guildId) {
      id
      name
      type
    }
  }
`;

// Connected Discord bots — feeds the bot picker in the "Send Discord Message"
// automation action (for channel/DM sends that aren't tied to a conversation).
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

// Routable channels for a given bot (token resolved server-side) — feeds the
// channel dropdown when sending to a specific channel.
export const DISCORD_BOT_CHANNELS = gql`
  query DiscordBotChannels($botId: String!) {
    discordBotChannels(botId: $botId) {
      id
      name
      type
    }
  }
`;

// Connected Discord servers (guilds) with the integration ids belonging to
// each — lets the sidebar group channels under their server.
export const DISCORD_SERVERS = gql`
  query DiscordServers {
    discordServers {
      guildId
      name
      integrationIds
    }
  }
`;

// The Discord channel an inbox conversation originated from — so the inbox can
// show "#general" next to the Team Inbox channel name. Thread fields let the
// detail header show "general › sd" for threads.
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

// The Discord users who have chatted in a conversation, for @-mentioning them
// in an agent reply.
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

// Batch variant: resolves thread/channel metadata for many conversations at
// once so the inbox list can nest threads under their parent channel without a
// query per row.
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
