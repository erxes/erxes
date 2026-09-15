export const types = `
  type ViberMediaSettings {
    hostnames: [String!]!
    source: String!
  }
  type ViberConnection {
    integrationId: String!
    botId: String!
    name: String
    healthStatus: String!
    error: String
    webhookUrl: String
  }
  type ViberSetup {
    webhookUrl: String
    webhookError: String
    mediaHostnames: [String!]!
    mediaError: String
    storageProvider: String
    storageError: String
  }
  type ViberConversationState {
    canSend: Boolean!
    reason: String
    subscribed: Boolean
  }
  type ViberMessagePartStatus {
    index: Int!
    type: String!
    state: String!
    messageToken: String
    error: String
    deliveredAt: Date
    seenAt: Date
    failedAt: Date
  }
  type ViberMessageStatus {
    _id: String!
    state: String!
    error: String
    parts: [ViberMessagePartStatus!]!
  }
  extend type ConversationMessage {
    viberDelivery: ViberMessageStatus
  }
`;

export const queries = `
  viberMediaSettings: ViberMediaSettings!
  viberSetup: ViberSetup!
  viberConversationState(conversationId: String!): ViberConversationState!
  viberConnection(integrationId: String!): ViberConnection
  viberMessageStatus(messageId: String!): ViberMessageStatus
`;

export const mutations = `
  viberUpdateMediaSettings(hostnames: [String!]): ViberMediaSettings!
  viberSendMessage(conversationId: String!, content: String, attachments: [AttachmentInput], message: JSON, requestId: String, responseTemplateId: String): ConversationMessage
  viberRetryMessage(messageId: String!): ConversationMessage
  viberUpdateToken(integrationId: String!, token: String!): Boolean!
`;
