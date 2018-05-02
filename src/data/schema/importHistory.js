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
  ImportHistoryDetail(perPage: Int, page: Int): ImportHistory
`;

export const mutations = `
  importHistoriesAdd(success: Int, failed: Int, total: Int, customerIds: [String]): ImportHistory
  importHistoriesRemove(_id: String!): ImportHistory
`;
