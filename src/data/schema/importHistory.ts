export const types = `
  type ImportHistory {
    _id: String!
    success: String!
    failed: String
    total: String
    ids: [String]
    contentType: String
    errorMsgs: [String]
    status: String
    percentage: Float

    date: Date
    user: User
  }

  type ImportHistoryList {
    list: [ImportHistory]
    count: Int 
  }
`;

export const queries = `
  importHistories(perPage: Int, page: Int, type: String!): ImportHistoryList
  importHistoryDetail(_id: String!): ImportHistory
`;

export const mutations = `
  importHistoriesRemove(_id: String!): JSON
  importHistoriesCancel(_id: String!): Boolean
`;
