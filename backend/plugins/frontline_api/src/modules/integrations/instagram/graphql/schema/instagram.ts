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
  greetText:String
  tag:String,
  isEnabledBackBtn:Boolean,
  backButtonText:String
`;

const commentQueryParamDefs = `conversationId: String!, isResolved: Boolean`;

const pageParams = `skip: Int, limit: Int`;

export const types = `


  type InstagramCustomer {
    _id: String
    userId: String
    erxesApiId: String
    firstName: String
    lastName: String
    profilePic: String
    integrationId: String
  }
  type InstagramPosts {
    message: String
    created_time: String
    picture: String
    full_picture:String
    permalink_url: String
    id: String
  }
  type InstagramComment {
    ${commonCommentAndMessageFields}
    commentId: String
    ${commonPostAndCommentFields}
    parentId: String
    customer: InstagramCustomer
    commentCount: Int
    isResolved: Boolean
  }

  type InstagramConversationMessage {
    _id: String!
    ${commonCommentAndMessageFields}
    attachments: [Attachment]
    fromBot: Boolean
    botData: JSON
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

  type InstagramPostMessage {
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


  type InstagramPost @key(fields: "_id") {
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

  input BotPersistentMenuInput {
    _id:String
    type:String
    text: String
    link: String
  }

  type InstagramMessengerBot {
    _id: String
    name:String
    accountId: String
    account:JSON
    pageId: String
    page: JSON
    createdAt: Date
    persistentMenus:[BotPersistentMenuType]
    profileUrl:String
    greetText:String
    tag:String
    isEnabledBackBtn:Boolean
    backButtonText:String
  }
`;

export const queries = `
  instagramGetAccounts(kind: String): JSON
  instagramGetIntegrations(kind: String): JSON
  instagramGetIntegrationDetail(erxesApiId: String): JSON
  instagramGetConfigs: JSON
  instagramGetComments(conversationId: String!, getFirst: Boolean, ${pageParams}): [InstagramPostMessage]
  instagramGetCommentCount(${commentQueryParamDefs}): JSON
  instagramGetPages(accountId: String! kind: String!): JSON
  instagramConversationDetail(_id: String!): JSON
  instagramConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [InstagramConversationMessage]
  instagramConversationMessagesCount(conversationId: String!): Int
  instagramGetPost(erxesApiId: String): InstagramPost
  instagramHasTaggedMessages(conversationId: String!): Boolean

  instagramPostMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [InstagramPostMessage]
  instagramMessengerBotsTotalCount:Int
  instagramMessengerBots:[InstagramMessengerBot]
  instagramMessengerBot(_id:String):InstagramMessengerBot
  instagramGetBotPosts(botId:String):JSON
  instagramGetBotPost(botId:String,postId:String):JSON
`;

export const mutations = `
  instagramUpdateConfigs(configsMap: JSON!): JSON
  instagramRepair(_id: String!): JSON
  instagramReplyToComment(conversationId: String, commentId: String, content: String): InstagramComment
  instagramMessengerAddBot(${commonBotMutationParams}):JSON
  instagramMessengerUpdateBot(_id:String,${commonBotMutationParams}):JSON
  instagramMessengerRemoveBot(_id:String):JSON
  instagramMessengerRepairBot(_id:String):JSON
`;
