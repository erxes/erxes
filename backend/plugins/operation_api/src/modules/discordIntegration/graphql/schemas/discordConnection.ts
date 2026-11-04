export const type = `
  type OperationDiscordHealth {
    status: String
    lastVerifiedAt: Date
    lastError: String
  }

  type OperationDiscordConnection {
    _id: String!
    guildId: String!
    guildName: String!
    guildIconUrl: String
    applicationId: String!
    botUserId: String!
    botUsername: String!
    hasClientSecret: Boolean
    commandsRegisteredAt: Date
    commandsError: String
    health: OperationDiscordHealth
    createdBy: String
    createdAt: Date!
    updatedAt: Date!
  }

  type OperationDiscordGuild {
    id: String!
    name: String!
    iconUrl: String
    isConnected: Boolean!
  }

  type OperationDiscordTokenCheck {
    applicationId: String!
    botUserId: String!
    botUsername: String!
    inviteUrl: String!
    guilds: [OperationDiscordGuild!]!
  }

  type OperationDiscordChannel {
    id: String!
    name: String!
    type: Int!
  }
`;

export const queries = `
  operationDiscordConnections: [OperationDiscordConnection!]!
  operationDiscordCheckToken(token: String!): OperationDiscordTokenCheck!
  operationDiscordChannels(connectionId: String!): [OperationDiscordChannel!]!
`;

export const mutations = `
  operationDiscordConnect(token: String!, guildId: String!): OperationDiscordConnection
  operationDiscordDisconnect(_id: String!): DisconnectResponse
  operationDiscordSetClientSecret(_id: String!, clientSecret: String!): OperationDiscordConnection
  operationDiscordClearClientSecret(_id: String!): OperationDiscordConnection
`;
