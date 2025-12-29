export const types = `
  type Import {
    _id: String
    entityType: String
    pluginName: String
    moduleName: String
    collectionName: String
    fileKey: String
    fileName: String
    status: String
    totalRows: Int
    processedRows: Int
    successRows: Int
    errorRows: Int
    importedIds: [String]
    errorFileUrl: String
    startedAt: Date
    completedAt: Date
    userId: String
    subdomain: String
    progress: Int
    elapsedSeconds: Int
    rowsPerSecond: Int
    estimatedSecondsRemaining: Int
    jobId: String
    createdAt: Date
    updatedAt: Date
  }

  type ImportHistoryList {
    list: [Import]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const queries = `
  importProgress(importId: String!): Import
  activeImports(entityType: String): [Import]
  importHistories(
    entityType: String
    limit: Int
    cursor: String
    direction: CURSOR_DIRECTION
    cursorMode: CURSOR_MODE
  ): ImportHistoryList
`;

export const mutations = `
  importStart(entityType: String!, fileKey: String!, fileName: String!): Import
  importCancel(importId: String!): Import
  importRetry(importId: String!): Import
  importResume(importId: String!): Import
`;
