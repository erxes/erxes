const commonMessageFields = `
  content: String
  conversationId: String
`;

const pageParams = `skip: Int, limit: Int`;

export const types = `
  type WhatsappConversationMessage {
    _id: String!
    ${commonMessageFields}
    attachments: [Attachment]
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    mid: String
    internal: Boolean
    customer: Customer
    user: User
  }
`;

export const queries = `
  whatsappGetIntegrations(kind: String): JSON
  whatsappGetIntegrationDetail(erxesApiId: String): JSON
  whatsappGetConfigs: JSON
  whatsappConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [WhatsappConversationMessage]
  whatsappConversationMessagesCount(conversationId: String!): Int
`;

export const mutations = `
  whatsappUpdateConfigs(configsMap: JSON!): JSON
`;
