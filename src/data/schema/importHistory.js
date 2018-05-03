export const types = `
  type ImportHistory {
    _id: String!
    success: String!
    failed: String
    total: String
    ids: [String]
    contentType: String

    importedDate: Date
    importedUser: User
  }
`;

export const queries = `
  importHistories(perPage: Int, page: Int, type: String!): [ImportHistory]
`;

export const mutations = `
  importHistoriesRemove(_id: String!): String
`;
