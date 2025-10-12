import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  extend type Customer @key(fields: "_id") {
    _id: String @external
    conversations: [Conversation]
  }
  extend type Brand @key(fields: "_id") {
    _id: String @external
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

    messages: [ConversationMessage]
    callProAudio: String

    tags: [Tag]
    customer: Customer
    integration: Integration
    user: User
    assignedUser: User
    participatedUsers: [User]
    readUsers: [User]
    participatorCount: Int


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
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: EngageData
    formWidgetData: JSON
    messengerAppData: JSON
    botGreetMessage: String
    user: User
    mailData: MailData
    contentType: String
    mid: String
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
    text: String
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

const mutationFilterParams = `
  channelId: String
  status: String
  unassigned: String
  tag: String
  integrationType: String
  participating: String
  awaitingResponse: String
  starred: String
  startDate: String
  endDate: String
  segment: String
`;

const convertParams = `
  _id: String!
  type: String!
  itemId: String
  itemName: String
  stageId: String
  customFieldsData: JSON
  priority: String
  assignedUserIds: [String]
  labelIds: [String]
  startDate: Date
  closeDate: Date
  attachments: [AttachmentInput]
  description: String
`;

export const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
  orderBy: JSON
`;

const filterParams = `
  ids: [String]
  ${cursorParams}
  ${mutationFilterParams}
`;

export const queries = `
  conversationMessage(_id: String!): ConversationMessage

  conversations(${filterParams}, skip: Int): ConversationListResponse
  conversationMessages(
    conversationId: String!
    skip: Int
    limit: Int
    getFirst: Boolean
  ): [ConversationMessage]

  conversationMessagesTotalCount(conversationId: String!): Int
  conversationCounts(${filterParams}, only: String): JSON
  conversationsTotalCount(${filterParams}): Int
  conversationDetail(_id: String!): Conversation
  conversationsGetLast(${filterParams}): Conversation
  conversationsTotalUnreadCount: Int
  userConversations(_id: String, ${GQL_CURSOR_PARAM_DEFS}, perPage: Int): UserConversationListResponse
`;

export const mutations = `
  conversationMessageAdd(
    conversationId: String,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [AttachmentInput],
    contentType: String
    extraInfo: JSON
  ): ConversationMessage
  conversationMessageEdit(
    _id: String!,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [AttachmentInput],
    contentType: String
    extraInfo: JSON
  ): ConversationMessage
  conversationsAssign(conversationIds: [String]!, assignedUserId: String): [Conversation]
  conversationsUnassign(_ids: [String]!): [Conversation]
  conversationsChangeStatus(_ids: [String]!, status: String!): [Conversation]
  conversationMarkAsRead(_id: String): Conversation
  changeConversationOperator(_id: String!, operatorStatus: String!): JSON
  conversationResolveAll(${mutationFilterParams}): Int
  conversationConvertToCard(${convertParams}): String
  conversationEditCustomFields(_id: String!, customFieldsData: JSON): Conversation
`;
