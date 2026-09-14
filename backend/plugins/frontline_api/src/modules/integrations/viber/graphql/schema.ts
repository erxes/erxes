export const types = `
  type ViberConnection {
    integrationId: String!
    botId: String!
    name: String
    healthStatus: String!
    error: String
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
    parts: [ViberMessagePartStatus!]!
  }
  extend type ConversationMessage {
    viberDelivery: ViberMessageStatus
  }
`;

export const queries = `
  viberConnection(integrationId: String!): ViberConnection
  viberMessageStatus(messageId: String!): ViberMessageStatus
`;

export const mutations = `
  viberSendMessage(conversationId: String!, content: String, attachments: [AttachmentInput], message: JSON): ConversationMessage
  viberRetryMessage(messageId: String!): ConversationMessage
  viberUpdateToken(integrationId: String!, token: String!): Boolean!
`;
