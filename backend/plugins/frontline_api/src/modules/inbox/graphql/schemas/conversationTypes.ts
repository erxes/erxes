export const types = `
  extend type Customer @key(fields: "_id") {
    _id: String @external
    conversations: [Conversation]
  }

  extend type Tag @key(fields: "_id") {
    _id: String @external
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
    updatedAt: Date
    idleTime: Float
    status: String
    messageCount: Int
    number: Int
    tagIds: [String]
    operatorStatus: String
    automatedReplyControl: JSON

    messages: [ConversationMessage]
    callProAudio: String
    callProPotentialCustomerIds: [String]
    callProPhone: String

    tags: [Tag]
    customer: Customer
    integration: Integration
    user: User
    assignedUser: User
    participatedUsers: [User]
    readUsers: [User]
    participatorCount: Int

    propertiesData: JSON
    customFieldsData: JSON
    cursor: String
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
    attachments: [Attachment]
    mentionedUserIds: [String]
    conversationId: String
    internal: Boolean
    fromBot: Boolean
    getStarted:Boolean
    botData: JSON
    source: JSON
    relatedMessage: JSON
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: EngageData
    formWidgetData: JSON
    messengerAppData: JSON
    extraData: JSON
    botGreetMessage: String
    user: User
    mailData: MailData
    contentType: String
    mid: String
    messageKind: String
    providerData: JSON
    replyTo: JSON
    reactions: JSON
    deliveryStatus: String
    expiresAt: Date
  }

  type Email {
    email: String
  }

  type MailData {
    messageId: String,
    threadId: String,
    replyTo: [String],
    inReplyTo: String,
    subject: String,
    body: String,
    integrationEmail: String,
    to: [Email],
    from: [Email],
    cc: [Email],
    bcc: [Email],
    accountId: String,
    replyToMessageId: [String],
    references: [String],
    headerId: String,
    attachments: [MailAttachment]
  }

  type MailAttachment {
    id: String,
    content_type: String,
    filename: String,
    mimeType: String,
    size: Int,
    attachmentId: String,
    data: String,
  }

  type ConversationChangedResponse {
    conversationId: String!
    type: String!
  }

  type ConversationClientTypingStatusChangedResponse {
    conversationId: String!
    customerId: String
    customerName: String
    text: String
  }

  type ConversationUnreadCountChangedResponse {
    conversationId: String!
    channelId: String!
    unreadConversationCount: Int!
  }

type ConversationListResponse {
  list: [Conversation]
  totalCount: Int
  pageInfo: PageInfo
}

  type ConversationAdminMessageInsertedResponse {
    customerId: String
    unreadCount: Int
  }

  type UserConversationListResponse {
    list: [Conversation],
    pageInfo: PageInfo,
    totalCount: Int,
  }

  type ConversationConvertedItem {
    type: String
    _id: String
    url: String
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

  # A native poll an agent composes in the inbox (currently Discord).
  input ConversationPollInput {
    question: String!
    options: [String!]!
    duration: Int
    allowMultiselect: Boolean
  }

`;
