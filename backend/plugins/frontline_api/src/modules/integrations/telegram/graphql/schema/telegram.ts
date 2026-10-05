export const types = `
  type TelegramTokenValidation {
    valid: Boolean!
    botId: String
    botUsername: String
    botName: String
    canJoinGroups: Boolean
    canReadAllGroupMessages: Boolean
    error: String
  }

  type TelegramBot {
    _id: String!
    botId: String!
    erxesApiId: String
    botUsername: String
    botName: String!
    canJoinGroups: Boolean
    canReadAllGroupMessages: Boolean
    lastVerifiedAt: Date!
    createdAt: Date!
    updatedAt: Date!
    createdBy: String!
  }

  type TelegramWebhookInfo {
    url: String!
    hasCustomCertificate: Boolean!
    pendingUpdateCount: Int!
    ipAddress: String
    lastErrorDate: Date
    lastErrorMessage: String
    lastSynchronizationErrorDate: Date
    maxConnections: Int
    allowedUpdates: [String!]
  }
`;

export const queries = `
  telegramBots: [TelegramBot!]!
  telegramBot(_id: String!): TelegramBot!
  telegramValidateToken(token: String!): TelegramTokenValidation!
  telegramBotWebhookInfo(_id: String!): TelegramWebhookInfo!
`;

export const mutations = `
  telegramAddBot(token: String!): TelegramBot!
  telegramSetWebhook(_id: String!, url: String!): Boolean!
`;
