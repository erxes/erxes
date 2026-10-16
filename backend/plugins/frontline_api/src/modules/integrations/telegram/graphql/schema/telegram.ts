export const types = `
  type TelegramConversationChat {
    conversationId: String!
    chatId: String!
    chatType: String!
    chatTitle: String
    messageThreadId: Float!
    topicName: String
  }
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

  type TelegramLinkPreviewProvider {
    name: String!
  }

  type TelegramLinkPreviewImage {
    url: String!
  }

  type TelegramLinkPreview {
    type: String!
    url: String!
    title: String!
    description: String
    provider: TelegramLinkPreviewProvider!
    image: TelegramLinkPreviewImage
  }
`;

export const queries = `
  telegramMessageLinkPreviews(messageId: String!): [TelegramLinkPreview!]!
  telegramConversationChats(conversationIds: [String!]!): [TelegramConversationChat!]!
  telegramBots: [TelegramBot!]!
  telegramBot(_id: String!): TelegramBot!
  telegramValidateToken(token: String!): TelegramTokenValidation!
  telegramBotWebhookInfo(_id: String!): TelegramWebhookInfo!
`;

export const mutations = `
  telegramUpdateBot(_id: String!, token: String): TelegramBot!
  "Pauses the integration locally; returns whether Telegram webhook removal was confirmed."
  telegramDisconnectBot(_id: String!): Boolean!
  telegramAddBot(token: String!): TelegramBot!
  telegramSetWebhook(_id: String!, url: String!): Boolean!
`;
