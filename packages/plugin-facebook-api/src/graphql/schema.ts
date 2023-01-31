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
    _id: String! @external
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

    customer: Customer
    user: User
  }

  type FacebookPost @key(fields: "_id") {
    _id: String!
    ${commonPostAndCommentFields}
    content:String
  }
`;

export const queries = `
  facebookGetAccounts(kind: String): JSON
  facebookGetIntegrations(kind: String): JSON
  facebookGetIntegrationDetail(erxesApiId: String): JSON 
  facebookGetConfigs: JSON
  facebookGetComments(
    ${commentQueryParamDefs},
    commentId: String,
    senderId: String,
    ${pageParams}
  ): [FacebookComment]
  facebookGetCommentCount(${commentQueryParamDefs}): JSON
  facebookGetPages(accountId: String! kind: String!): JSON
  facebookConversationDetail(_id: String!): JSON
  facebookConversationMessages(conversationId: String! getFirst: Boolean, ${pageParams}): [FacebookConversationMessage]
  facebookConversationMessagesCount(conversationId: String!): Int
  facebookGetPost(erxesApiId: String): FacebookPost
  facebookHasTaggedMessages(conversationId: String!): Boolean
`;

export const mutations = `
  facebookUpdateConfigs(configsMap: JSON!): JSON
  facebookRepair(_id: String!): JSON
  facebookChangeCommentStatus(commentId: String): FacebookComment
  facebookReplyToComment(conversationId: String, commentId: String, content: String): FacebookComment
`;
