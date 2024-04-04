export const types = `
  type ExportHistory {
    _id: String!
    total: String
    contentType: String
    date: Date
    status: String
    user: User
    exportLink: String
    name: String
    percentage: Float
    uploadType: String
    errorMsg: String
  }

  type ExportHistoryList {
    list: [ExportHistory]
    count: Int 
  }
`;

export const queries = `
  exportHistories(perPage: Int, page: Int, type: String): ExportHistoryList
  exportHistoryDetail(_id: String!): ImportHistory
  exportHistoryGetColumns(attachmentName: String): JSON
  exportHistoryGetDuplicatedHeaders(attachmentNames: [String]): JSON
`;

export const mutations = `
  exportHistoriesCreate(contentType: String!, columnsConfig: [String], segmentData: JSON, name: String): JSON
`;
