export const types = `
  type DiscordBotHealth {
    status: String
    isTokenValid: Boolean
    botUsername: String
    lastVerifiedAt: Date
    lastError: String
  }

  type DiscordBot {
    _id: String!
    name: String
    applicationId: String
    guildId: String
    guildName: String
    channelId: String
    description: String
    erxesApiId: String
    health: DiscordBotHealth
    createdBy: String
    updatedBy: String
    createdAt: Date
    updatedAt: Date
  }

  # Result of probing a pasted bot token against Discord during setup. Lets the
  # connect wizard confirm the token, auto-derive the application id, and warn
  # when the MESSAGE CONTENT intent is missing.
  type DiscordTokenValidation {
    valid: Boolean!
    botId: String
    botUsername: String
    applicationId: String
    hasMessageContentIntent: Boolean
    error: String
  }

  type FrontlineDiscordGuild {
    id: String!
    name: String
    icon: String
  }

  type DiscordChannel {
    id: String!
    name: String
    type: Int
  }

  # The Discord channel a given inbox conversation originated from, so the
  # inbox can show "#general" alongside the Team Inbox channel name. When the
  # source is a thread, isThread is true and parentChannelName names the channel
  # the thread lives under, so the inbox can nest it (e.g. "general › sd").
  type DiscordConversationChannel {
    conversationId: String
    channelId: String
    channelName: String
    guildId: String
    isThread: Boolean
    parentChannelId: String
    parentChannelName: String
  }

  # A Discord user who has chatted in a conversation, for @-mentioning them in
  # an agent reply. customerId is the inbox customer id; userId is the Discord id.
  type DiscordParticipant {
    customerId: String
    userId: String
    name: String
    avatar: String
  }

  # A connected Discord server (guild) with the inbox integrations (one per
  # Discord channel) that belong to it — lets the sidebar group channels under
  # their server instead of mixing every server's channels into one list.
  type DiscordServer {
    guildId: String!
    name: String
    integrationIds: [String!]!
  }
`;

// token is a write-only secret (never exposed on the DiscordBot type).
// channelIds = inbox channels to surface the conversation in (not Discord channels).
const addBotParams = `
  name: String!
  applicationId: String!
  token: String!
  guildId: String
  guildName: String
  channelId: String
  description: String
  channelIds: [String]
`;

const updateBotParams = `
  name: String
  applicationId: String
  token: String
  guildId: String
  guildName: String
  channelId: String
  description: String
`;

export const queries = `
  discordBots: [DiscordBot]
  discordBot(_id: String!): DiscordBot
  discordBotsTotalCount: Int
  discordValidateToken(token: String!): DiscordTokenValidation
  discordGuilds(token: String!): [FrontlineDiscordGuild]
  discordGuildChannels(token: String!, guildId: String!): [DiscordChannel]
  discordBotChannels(botId: String!): [DiscordChannel]
  discordConversationChannel(conversationId: String!): DiscordConversationChannel
  discordConversationChannels(conversationIds: [String!]!): [DiscordConversationChannel]
  discordConversationParticipants(conversationId: String!): [DiscordParticipant]
  discordServers: [DiscordServer]
`;

export const mutations = `
  discordAddBot(${addBotParams}): DiscordBot
  discordUpdateBot(_id: String!, ${updateBotParams}): DiscordBot
  discordRemoveBot(_id: String!): JSON
`;
