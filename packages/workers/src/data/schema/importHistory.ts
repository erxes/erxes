export const types = `
  type ImportHistory {
    _id: String!
    success: String!
    failed: String
    total: String
    contentTypes: JSON
    errorMsgs: [String]
    status: String
    percentage: Float
    updated: String
    name: String
    attachments: JSON
    removed: [String]
    ids: [String]
    
    date: Date
    user: JSON
    error: String
  }

  type ImportHistoryList {
    list: [ImportHistory]
    count: Int 
  }
`;

export const queries = `
  importHistoryGetTypes: JSON
  importHistories(perPage: Int, page: Int, type: String): ImportHistoryList
  importHistoryDetail(_id: String!): ImportHistory
  importHistoryPreviewExportCount(segmentId: String, contentType: String!): String
  importHistoryGetColumns(attachmentName: String): JSON
  importHistoryGetDuplicatedHeaders(attachmentNames: [String]): JSON
  importHistoryGetExportableServices: JSON
`;

export const mutations = `
  importHistoriesRemove(_id: String!, contentType: String!): JSON
  importHistoriesCancel(_id: String!): Boolean
  importHistoriesCreate(contentTypes: [JSON], files: JSON, columnsConfig: JSON, importName: String, associatedContentType: String, associatedField: String): JSON
`;
