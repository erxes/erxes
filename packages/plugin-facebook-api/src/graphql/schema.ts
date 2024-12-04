import { attachmentType } from '@erxes/api-utils/src/commonTypeDefs';

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

const commentQueryParamDefs = `conversationId: String!, isResolved: Boolean`;

const pageParams = `skip: Int, limit: Int`;

export const types = `
  ${attachmentType}

  extend type Customer @key(fields: "_id") {
    _id: String @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

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

  input BotPersistentMenuInput {
    _id:String
    type:String
    text: String
    link: String
  }

  type FacebookMessengerBot {
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
  facebookGetAccounts(kind: String): JSON
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
  facebookPostMessagesCount(conversationId: String!): Int

  facebootMessengerBots:[FacebookMessengerBot]
  facebootMessengerBotsTotalCount:Int
  facebootMessengerBot(_id:String):FacebookMessengerBot
  facebookGetBotPosts(botId:String):JSON
  facebookGetPosts(channelIds: [String], brandIds: [String], limit: Int): [FacebookPosts]
  facebookGetBotPost(botId:String,postId:String):JSON
  facebookGetBotAds(botId:String):JSON
`;

const commonBotParams = `
  name:String,
  accountId:String,
  pageId:String,
  persistentMenus:[BotPersistentMenuInput],
  greetText:String
  tag:String,
  isEnabledBackBtn:Boolean,
  backButtonText:String
`;

export const mutations = `
  facebookUpdateConfigs(configsMap: JSON!): JSON
  facebookMessengerAddBot(${commonBotParams}):JSON
  facebookMessengerUpdateBot(_id:String,${commonBotParams}):JSON
  facebookMessengerRemoveBot(_id:String):JSON
  facebookMessengerRepairBot(_id:String):JSON
  facebookRepair(_id: String!): JSON
  facebookChangeCommentStatus(commentId: String): FacebookComment
  facebookReplyToComment(conversationId: String, commentId: String, content: String): FacebookComment
`;
