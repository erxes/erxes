export const types = `
  extend type Customer @key(fields: "_id") {
    _id: String! @external

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

  type MessengerConnectResponse {
    integrationId: String
    uiOptions: JSON
    languageCode: String
    messengerData: JSON
    customerId: String
    visitorId: String
    brand: Brand
  }

  type ConversationDetailResponse {
    _id: String
    messages: [ConversationMessage]
    operatorStatus: String
    participatedUsers: [User]
    isOnline: Boolean
    supporters: [User]
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
    attachments: [JSON]
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

  conversationMessage(_id: String!): ConversationMessage

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

  widgetsConversations(integrationId: String!, customerId: String, visitorId: String): [Conversation]
  widgetsConversationDetail(_id: String, integrationId: String!): ConversationDetailResponse
  widgetExportMessengerData(_id: String, integrationId: String!): String
  widgetsGetMessengerIntegration(brandCode: String!): Integration
  widgetsMessages(conversationId: String): [ConversationMessage]
  widgetsUnreadCount(conversationId: String): Int
  widgetsTotalUnreadCount(integrationId: String!, customerId: String, visitorId: String): Int
  widgetsGetEngageMessage(integrationId: String, customerId: String, visitorId: String, browserInfo: JSON!): ConversationMessage
`;

export const mutations = `
  conversationMessageAdd(
    conversationId: String,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [JSON],
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

  widgetsMessengerConnect(
    brandCode: String!
    email: String
    phone: String
    code: String
    isUser: Boolean

    companyData: JSON
    data: JSON

    visitorId: String
    cachedCustomerId: String
    deviceToken: String
  ): MessengerConnectResponse

  widgetsSaveBrowserInfo(
    visitorId: String
    customerId: String
    browserInfo: JSON!
  ): ConversationMessage

  widgetsInsertMessage(
    integrationId: String!
    customerId: String
    visitorId: String
    conversationId: String
    message: String,
    attachments: [JSON],
    contentType: String,
    skillId: String
  ): ConversationMessage

  widgetBotRequest(
    customerId: String
    visitorId: String
    conversationId: String
    integrationId: String!,
    message: String!
    payload: String!
    type: String!
    ): JSON

  widgetGetBotInitialMessage(integrationId: String): JSON
  widgetsSendTypingInfo(conversationId: String!, text: String): String
  widgetsReadConversationMessages(conversationId: String): JSON
  widgetsSaveCustomerGetNotified(customerId: String, visitorId: String, type: String!, value: String!): JSON
`;