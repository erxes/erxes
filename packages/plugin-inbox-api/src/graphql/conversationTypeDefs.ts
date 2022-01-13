export const types = `
  extend type Attachment @key(fields: "url") {
    url: String! @external
  }

  extend type Customer @key(fields: "_id") {
    _id: String! @external

    integration: Integration
    conversations: [Conversation]
  }

  extend type Brand @key(fields: "_id") {
    _id: String! @external
  }

  extend type Tag @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type ConversationFacebookData {
    kind: String
    senderName: String
    senderId: String
    recipientId: String
    postId: String
    pageId: String
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
    facebookPost: FacebookPost
    callProAudio: String
    tags: [Tag]
    customer: Customer
    integration: Integration
    user: User
    assignedUser: User
    participatedUsers: [User]
    participatorCount: Int
    videoCallData: VideoCallData
    isFacebookTaggedMessage: Boolean
    customFieldsData: JSON

    bookingProductId: String
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
    botData: JSON
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: EngageData
    formWidgetData: JSON
    messengerAppData: JSON
    user: User
    customer: Customer
    mailData: MailData
    videoCallData: VideoCallData
    contentType: String
    bookingWidgetData: JSON
  }

  type FacebookPost {
    postId: String
    recipientId: String
    senderId: String
    content:String
    erxesApiId: String
    attachments: [String]
    timestamp: Date
    permalink_url: String
  }

  type FacebookComment {
    conversationId: String
    commentId: String
    postId: String
    parentId: String
    recipientId:String
    senderId: String
    permalink_url: String
    attachments: [String]
    content: String
    erxesApiId: String
    timestamp: Date
    customer: Customer
    commentCount: Int
    isResolved: Boolean
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

  type ConversationAdminMessageInsertedResponse {
    customerId: String
    unreadCount: Int
  }

  type VideoCallData {
    url: String
    name: String
    status: String
    recordingLinks: [String]
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

  input AttachmentInput {
    url: String!
    name: String!
    type: String
    size: Float
    duration: Float
  }
`;

const mutationFilterParams = `
  channelId: String
  status: String
  unassigned: String
  brandId: String
  tag: String
  integrationType: String
  participating: String
  awaitingResponse: String
  starred: String
  startDate: String
  endDate: String
  segment: String
`;

const filterParams = `
  limit: Int,
  ids: [String]
  ${mutationFilterParams}
`;

export const queries = `
  conversations(${filterParams}): [Conversation]

  conversationMessages(
    conversationId: String!
    skip: Int
    limit: Int
    getFirst: Boolean
  ): [ConversationMessage]

  converstationFacebookComments(
    postId: String!
    isResolved: Boolean
    commentId: String
    senderId: String
    skip: Int
    limit: Int
  ): [FacebookComment]

  converstationFacebookCommentsCount(
    postId: String!
    isResolved: Boolean
  ): JSON

  conversationMessagesTotalCount(conversationId: String!): Int
  conversationCounts(${filterParams}, only: String): JSON
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
    attachments: [AttachmentInput],
    contentType: String
    facebookMessageTag: String
  ): ConversationMessage
  conversationsReplyFacebookComment(conversationId: String, commentId: String, content: String): FacebookComment
  conversationsChangeStatusFacebookComment(commentId: String): FacebookComment
  conversationsAssign(conversationIds: [String]!, assignedUserId: String): [Conversation]
  conversationsUnassign(_ids: [String]!): [Conversation]
  conversationsChangeStatus(_ids: [String]!, status: String!): [Conversation]
  conversationMarkAsRead(_id: String): Conversation
  conversationDeleteVideoChatRoom(name: String!): Boolean
  conversationCreateVideoChatRoom(_id: String!): VideoCallData
  changeConversationOperator(_id: String! operatorStatus: String!): JSON
  conversationResolveAll(${mutationFilterParams}): Int
  conversationsSaveVideoRecordingInfo(conversationId: String!, recordingId: String): String
  conversationConvertToCard(_id: String!, type: String!, itemId: String, itemName: String, stageId: String, bookingProductId: String): String
  conversationEditCustomFields(_id: String!, customFieldsData: JSON): Conversation
`;