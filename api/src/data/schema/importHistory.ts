export const types = `
  type ImportHistory {
    _id: String!
    success: String!
    failed: String
    total: String
    contentTypes: [String]
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
  importHistoryPreviewExportCount(segmentId: String, contentType: String!): Int
  importHistoryGetColumns(attachmentName: String): JSON
`;

export const mutations = `
  importHistoriesRemove(_id: String!): JSON
  importHistoriesCancel(_id: String!): Boolean
  importHistoriesCreate(contentTypes: [String], files: JSON, columnsConfig: JSON, importName: String, tagId: String): JSON
`;
