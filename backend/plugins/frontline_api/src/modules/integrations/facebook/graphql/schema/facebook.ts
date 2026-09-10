const commonCommentAndMessageFields = `
  content: String
  conversationId: String
`;

const commonPostAndCommentFields = `
  postId: String
  recipientId: String
  senderId: String
  erxesApiId: String
  attachments: [String]
  timestamp: Date
  permalink_url: String
`;

const commonBotMutationParams = `
  name:String,
  accountId:String,
  pageId:String,
  persistentMenus:[BotPersistentMenuInput],
  iceBreakers:[BotIceBreakerInput],
  getStartedText:String,
  greetText:String,
  handoffMessage:String,
  automationActiveMessage:String,
  handoffPauseMinutes:Int,
  tag:String,
  isEnabledBackBtn:Boolean,
  backButtonText:String
`;

const commentQueryParamDefs = `conversationId: String!, isResolved: Boolean`;

const pageParams = `skip: Int, limit: Int`;

export const types = `


  type FacebookCustomer {
    _id: String
    userId: String
    erxesApiId: String
    firstName: String
    lastName: String
    profilePic: String
    integrationId: String
  }
  type FacebookPosts {
    message: String
    created_time: String
    picture: String
    full_picture:String
    permalink_url: String
    id: String
  }
  type FacebookComment {
    ${commonCommentAndMessageFields}
    commentId: String
    ${commonPostAndCommentFields}
    parentId: String
    customer: FacebookCustomer
    commentCount: Int
    isResolved: Boolean
  }

  type FacebookConversationMessage {
    _id: String!
    ${commonCommentAndMessageFields}
    attachments: [Attachment]
    fromBot: Boolean
    botData: JSON
    source: JSON
    messageKind: String
    providerData: JSON
    replyTo: JSON
    expiresAt: Date
    reactions: JSON
    relatedMessage: JSON
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    mid: String
    internal: Boolean
    permalink_url:String
    postContent: String
    customer: Customer
    user: User
  }

  type FacebookPostMessage {
    _id: String!
    ${commonCommentAndMessageFields}
    attachments: [Attachment]
    customerId: String
    userId: String
    createdAt: Date
    commentId: String

    customer: Customer
    user: User
  }


  type FacebookPost @key(fields: "_id") {
    _id: String!
    ${commonPostAndCommentFields}
    content:String
  }

  type BotPersistentMenuType {
    _id:String
    type:String
    text: String
    link: String
  }

  type FacebookBotHealth {
    status: String
    isSubscribed: Boolean
    isProfileSynced: Boolean
    lastSyncedAt: Date
    lastVerifiedAt: Date
    lastError: String
    sendBlockedUntil: Date
    sendBlockReason: String
    sendBlockCount: Int
  }

  type FacebookBotDelivery {
    pending: Int
    sent: Int
    failed: Int
    nextSendAt: Date
  }

  type FacebookBotCommentReplyPost {
    postId: String
    count: Int
    content: String
    permalinkUrl: String
  }

  type FacebookBotCommentReplyStat {
    text: String
    total: Int
    sent: Int
    failed: Int
    pending: Int
    postCount: Int
    posts: [FacebookBotCommentReplyPost]
    lastAt: Date
    lastError: String
  }

  input BotPersistentMenuInput {
    _id:String
    type:String
    text: String
    link: String
  }

  type BotIceBreakerType {
    _id:String
    question: String
  }

  input BotIceBreakerInput {
    _id:String
    question: String
  }

  type FacebookMessengerBot {
    _id: String
    name:String
    accountId: String
    account:JSON
    pageId: String
    page: JSON
    createdAt: Date
    updatedAt: Date
    createdBy: String
    updatedBy: String
    createdUser: User
    updatedUser: User
    persistentMenus:[BotPersistentMenuType]
    iceBreakers:[BotIceBreakerType]
    getStartedText:String
    profileUrl:String
    greetText:String
    handoffMessage:String
    automationActiveMessage:String
    handoffPauseMinutes:Int
    tag:String
    isEnabledBackBtn:Boolean
    backButtonText:String
    health: FacebookBotHealth
  }
`;

export const queries = `
  facebookGetAccounts(kind: String, integrationKind: String): JSON
  facebookGetIntegrations(kind: String): JSON
  facebookGetIntegrationDetail(erxesApiId: String): JSON
  facebookGetConfigs: JSON
  facebookGetComments(conversationId: String!, getFirst: Boolean, ${pageParams}): [FacebookPostMessage]
  facebookGetCommentCount(${commentQueryParamDefs}): JSON
  facebookGetPages(accountId: String! kind: String!): JSON
  facebookConversationDetail(_id: String!): JSON
  facebookConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [FacebookConversationMessage]
  facebookConversationMessagesCount(conversationId: String!): Int
  facebookGetPost(erxesApiId: String): FacebookPost
  facebookHasTaggedMessages(conversationId: String!): Boolean

  facebookPostMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [FacebookPostMessage]
  facebookMessengerBotsTotalCount:Int
  facebookMessengerBots:[FacebookMessengerBot]
  facebookMessengerBot(_id:String):FacebookMessengerBot
  facebookMessengerBotDelivery(_id:String!):FacebookBotDelivery
  facebookMessengerBotCommentReplyStats(_id:String!, limit:Int):[FacebookBotCommentReplyStat]
  facebookGetBotPosts(botId:String):JSON
  facebookGetBotPost(botId:String,postId:String):JSON
`;

export const mutations = `
  facebookUpdateConfigs(configsMap: JSON!): JSON
  facebookRepair(_id: String!): JSON
  facebookReplyToComment(conversationId: String, commentId: String, content: String): FacebookComment
  facebookCreatePost(erxesApiId: String!, pageId: String!, message: String!, link: String, imageKeys: [String]): JSON
  facebookMessengerAddBot(${commonBotMutationParams}):FacebookMessengerBot
  facebookMessengerUpdateBot(_id:String,${commonBotMutationParams}):FacebookMessengerBot
  facebookMessengerRemoveBot(_id:String):JSON
  facebookMessengerRepairBot(_id:String):JSON
`;
