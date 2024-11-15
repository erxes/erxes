import { attachmentType } from '@erxes/api-utils/src/commonTypeDefs';

const commonCommentAndMessageFields = `
  content: String
  conversationId: String
`;

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



  type WhatsAPPConversationMessage {
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


`;

export const queries = `
  whatsappGetAccounts(kind: String): JSON
  whatsappGetIntegrations(kind: String): JSON
  whatsappGetIntegrationDetail(erxesApiId: String): JSON 
  whatsappGetConfigs: JSON
  whatsappGetNumbers(accountId: String! kind: String!): JSON
  whatsappConversationDetail(_id: String!): JSON
  whatsappConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [WhatsAPPConversationMessage]
  whatsappConversationMessagesCount(conversationId: String!): Int
  whatsappHasTaggedMessages(conversationId: String!): Boolean
`;

export const mutations = `
  whatsappUpdateConfigs(configsMap: JSON!): JSON
  whatsappRepair(_id: String!): JSON

`;
