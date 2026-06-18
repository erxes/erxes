export const queries = `
  cpIntegrations(kind: String, integrationId: String, channelId: String): [Integration]
  cpConversation(customerId: String, integrationId: String, limit: Int, skip: Int): [Conversation]
  cpConversationDetail(_id: String!): Conversation
`;

export const mutations = `
  cpConnect(
    integrationId: String!
    email: String
    phone: String
    code: String
    isUser: Boolean
    companyData: JSON
    data: JSON
    cachedCustomerId: String
    deviceToken: String
    visitorId: String
  ): MessengerConnectResponse

  cpInsertMessage(
    integrationId: String!
    customerId: String
    visitorId: String
    conversationId: String
    message: String!
    skillId: String
    attachments: [AttachmentInput]
    contentType: String
    payload: String
  ): ConversationMessage
`;

export const subscriptions = `
  cpConversationChanged(_id: String!): ConversationChangedResponse
  cpConversationMessageInserted(_id: String!): ConversationMessage
  cpConversationClientMessageInserted(userId: String!): ConversationMessage
`;
