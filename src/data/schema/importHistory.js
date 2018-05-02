export const types = `
  type ImportHistory {
    _id: String!
    success: String!
    failed: String
    total: String
    ids: [String]
    cocContentType: String

    importedDate: Date
    importedUser: User
  }
`;

export const queries = `
  importHistories(perPage: Int, page: Int, type: String!): [ImportHistory]
`;

export const mutations = `
  importHistoriesAdd(success: Int, failed: Int, total: Int, customerIds: [String]): ImportHistory
  importHistoriesRemove(_id: String!): ImportHistory
`;
