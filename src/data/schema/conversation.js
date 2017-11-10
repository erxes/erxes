export const types = `
  input ConversationListParams {
    limit: Int,
    channelId: String
    status: String
    unassigned: String
    brandId: String
    tag: String
    integrationType: String
    participating: String
    starred: String
    ids: [String]
  }


  type Conversation {
    _id: String!
    content: String
    integrationId: String
    customerId: String
    userId: String
    assignedUserId: String
    participatedUserIds: [String]
    readUserIds: [String]
    createdAt: Date
    status: String
    messageCount: Int
    number: Int
    tagIds: [String]
    twitterData: JSON
    facebookData: JSON

    messages: [ConversationMessage]
    tags: [Tag]
    customer: Customer
    integration: Integration
    user: User
    assignedUser: User
    participatedUsers: [User]
    participatorCount: Int
  }

  type ConversationMessage {
    _id: String!
    content: String
    attachments: JSON
    mentionedUserIds: [String]
    conversationId: String
    internal: Boolean
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: JSON
    formWidgetData: JSON
    facebookData: JSON

    user: User
    customer: Customer
  }

  type ConversationChangedResponse {
    conversationId: String!
    type: String!
  }

  type ConversationsChangedResponse {
    type: String!
    customerId: String!
  }

  input ConversationMessageParams {
    content: String,
    mentionedUserIds: [String],
    conversationId: String,
    internal: Boolean,
    customerId: String,
    userId: String,
    createdAt: Date,
    isCustomerRead: Boolean,
  }
`;

export const queries = `
  conversations(params: ConversationListParams!): [Conversation]
  conversationCounts(params: ConversationListParams): JSON
  conversationDetail(_id: String!): Conversation
  conversationsTotalCount(params: ConversationListParams): Int
  conversationsGetLast: Conversation
`;

export const mutations = `
  conversationMessageAdd(
    conversationId: String,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [String],
  ): ConversationMessage

  conversationsAssign(conversationIds: [String]!, assignedUserId: String): [Conversation]
  conversationsUnassign(_ids: [String]!): [Conversation]
  conversationsChangeStatus(_ids: [String]!, status: String!): [Conversation]
  conversationsStar(_ids: [String]!): User
  conversationsUnstar(_ids: [String]!): User
  conversationsToggleParticipate(_ids: [String]!): Conversation
  conversationMarkAsRead(_id: String): Conversation
`;
