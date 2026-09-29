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
    botUsername: String
    botName: String!
    canJoinGroups: Boolean
    canReadAllGroupMessages: Boolean
    lastVerifiedAt: Date!
    createdAt: Date!
    updatedAt: Date!
    createdBy: String!
  }
`;

export const queries = `
  telegramBots: [TelegramBot!]!
  telegramBot(_id: String!): TelegramBot!
  telegramValidateToken(token: String!): TelegramTokenValidation!
`;

export const mutations = `
  telegramAddBot(token: String!): TelegramBot!
`;
