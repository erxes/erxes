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
  integrationsGetAccounts(kind: String): JSON
  integrationsGetIntegrations(kind: String): JSON
  integrationsGetIntegrationDetail(erxesApiId: String): JSON 

  integrationsGetGmailEmail(accountId: String): JSON
  integrationsGetConfigs: JSON
  integrationsConversationFbComments(
    postId: String!
    isResolved: Boolean
    commentId: String
    senderId: String
    skip: Int
    limit: Int
  ): [FacebookComment]

  integrationsConversationFbCommentsCount(postId: String! isResolved: Boolean): JSON
  integrationsGetNylasEvents(calendarIds: [String] startTime: Date endTime: Date): JSON

`;

export const mutations = `
  integrationsAdd: JSON
  integrationsUpdateConfigs(configsMap: JSON!): JSON
`;