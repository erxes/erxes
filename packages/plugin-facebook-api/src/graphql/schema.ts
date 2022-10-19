export const types = `  
  extend type Customer @key(fields: "_id") {
    _id: String! @external
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
`;

export const queries = `
  facebookGetAccounts(kind: String): JSON
  facebookGetIntegrations(kind: String): JSON
  facebookGetIntegrationDetail(erxesApiId: String): JSON 
  facebookGetConfigs: JSON
  facebookGetComments(
    postId: String!
    isResolved: Boolean
    commentId: String
    senderId: String
    skip: Int
    limit: Int
  ): [FacebookComment]
  facebookGetCommentCount(postId: String! isResolved: Boolean): JSON
  facebookGetPages(accountId: String! kind: String!): JSON
`;

export const mutations = `
  facebookUpdateConfigs(configsMap: JSON!): JSON
  facebookRepair(_id: String!): JSON
`;
