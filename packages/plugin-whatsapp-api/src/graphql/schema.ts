import { attachmentType } from "@erxes/api-utils/src/commonTypeDefs";

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

  type WhatsappCustomer {
    _id: String
    userId: String
    erxesApiId: String
    firstName: String
    lastName: String
    profilePic: String
    integrationId: String
  }

  type WhatsAppConversationMessage {
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

  type WhatsappMessengerBot {
    _id: String
    name:String
    accountId: String
    account:JSON
    whatsappNumberIds: [String!]
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
const commonBotParams = `
  name:String,
  accountId:String,
  whatsappNumberIds: [String!]
  persistentMenus:[BotPersistentMenuInput],
  greetText:String
  tag:String,
  isEnabledBackBtn:Boolean,
  backButtonText:String
`;
export const queries = `
  whatsappGetAccounts(kind: String): JSON
  whatsappGetIntegrations(kind: String): JSON
  whatsappGetIntegrationDetail(erxesApiId: String): JSON 
  whatsappGetConfigs: JSON
  whatsappGetNumbers(accountId: String! kind: String!): JSON
  whatsappConversationDetail(_id: String!): JSON
  whatsappConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [WhatsAppConversationMessage]
  whatsappConversationMessagesCount(conversationId: String!): Int
  whatsappHasTaggedMessages(conversationId: String!): Boolean
  whatsappBootMessengerBots:[WhatsappMessengerBot]
  whatsappBootMessengerBotsTotalCount:Int
  whatsappBootMessengerBot(_id:String):WhatsappMessengerBot
`;

export const mutations = `
  whatsappUpdateConfigs(configsMap: JSON!): JSON
  whatsappRepair(_id: String!): JSON
 whatsappMessengerAddBot(${commonBotParams}):JSON
 whatsappMessengerUpdateBot(_id:String,${commonBotParams}):JSON
 whatsappMessengerRemoveBot(_id:String):JSON
 whatsappMessengerRepairBot(_id:String):JSON
`;
