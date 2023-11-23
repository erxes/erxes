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

  type InstagramCustomer {
    _id: String
    userId: String
    erxesApiId: String
    firstName: String
    lastName: String
    profilePic: String
    integrationId: String
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
    
    customer: Customer
    user: User
  }

  type InstagramPost @key(fields: "_id") {
    _id: String!
    ${commonPostAndCommentFields}
    content:String
  }
`;

export const queries = `
  instagramGetAccounts(kind: String): JSON
  instagramGetIntegrations(kind: String): JSON
  instagramGetIntegrationDetail(erxesApiId: String): JSON 
  instagramGetConfigs: JSON
  instagramGetPages(accountId: String! kind: String!): JSON
  instagramConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [InstagramConversationMessage]
  instagramConversationMessagesCount(conversationId: String!): Int
  instagramHasTaggedMessages(conversationId: String!): Boolean
`;

export const mutations = `
  instagramUpdateConfigs(configsMap: JSON!): JSON
  instagramRepair(_id: String!): JSON

`;
