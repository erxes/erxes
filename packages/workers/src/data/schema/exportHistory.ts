export const types = `
  type ExportHistory {
    _id: String!
    success: String!
    total: String
    contentTypes: JSON
    errorMsgs: [String]
    status: String
    percentage: Float
    name: String
    attachments: JSON
    removed: [String]
    ids: [String]
    
    date: Date
    user: JSON
    error: String
  }

  type ExportHistoryList {
    list: [ExportHistory]
    count: Int 
  }
`;

export const queries = `
  exportHistoryGetTypes: JSON
  exportHistories(perPage: Int, page: Int, type: String): ExportHistoryList
  exportHistoryDetail(_id: String!): ImportHistory
  exportHistoryPreviewExportCount(segmentId: String, contentType: String!): String
  exportHistoryGetColumns(attachmentName: String): JSON
  exportHistoryGetDuplicatedHeaders(attachmentNames: [String]): JSON
  exportHistoryGetExportableServices: JSON
`;

export const mutations = `
  exportHistoriesRemove(_id: String!, contentType: String!): JSON
  exportHistoriesCancel(_id: String!): Boolean
  exportHistoriesCreate(contentType: String!, columnsConfig: [String], segmentId: String): JSON
`;
