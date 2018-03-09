export const types = `
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

  type EngageData {
    messageId: String
    brandId: String
    content: String
    fromUserId: String
    fromUser: User
    kind: String
    sentAs: String
  }

  type ConversationMessage {
    _id: String!
    content: String
    attachments: [JSON]
    mentionedUserIds: [String]
    conversationId: String
    internal: Boolean
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: EngageData
    formWidgetData: JSON
    twitterData: JSON
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

const filterParams = `
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
`;

export const queries = `
  conversations(${filterParams}): [Conversation]
  conversationCounts(${filterParams}): JSON
  conversationsTotalCount(${filterParams}): Int
  conversationDetail(_id: String!): Conversation
  conversationsGetLast(${filterParams}): Conversation
  conversationsTotalUnreadCount: Int
`;

export const mutations = `
  conversationMessageAdd(
    conversationId: String,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [JSON],
    tweetReplyToId: String,
    tweetReplyToScreenName: String,
  ): ConversationMessage

  conversationsAssign(conversationIds: [String]!, assignedUserId: String): [Conversation]
  conversationsUnassign(_ids: [String]!): [Conversation]
  conversationsChangeStatus(_ids: [String]!, status: String!): [Conversation]
  conversationsStar(_ids: [String]!): User
  conversationsUnstar(_ids: [String]!): User
  conversationsToggleParticipate(_ids: [String]!): Conversation
  conversationMarkAsRead(_id: String): Conversation
  conversationSubscribeMessageCreated(_id: String!): String
  conversationSubscribeChanged(_ids: [String], type: String!): String
`;
