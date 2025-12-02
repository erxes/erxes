export const types = `
  type Export {
    _id: String
    entityType: String
    pluginName: String
    moduleName: String
    collectionName: String
    fileName: String
    status: String
    totalRows: Int
    processedRows: Int
    fileFormat: String
    fileKeys: [String]
    filters: JSON
    ids: [String]
    startedAt: Date
    completedAt: Date
    userId: String
    subdomain: String
    progress: Int
    elapsedSeconds: Int
    rowsPerSecond: Int
    estimatedSecondsRemaining: Int
    errorMessage: String
    lastCursor: String
    jobId: String
    createdAt: Date
    updatedAt: Date
    selectedFields:[String]
  }

  type ExportHeader {
    label: String
    key: String
    isDefault: Boolean
    type: String
  }
`;

export const queries = `
  exportProgress(exportId: String!): Export
  activeExports(entityType: String): [Export]
  exportHeaders(entityType: String!): [ExportHeader]
`;

export const mutations = `
  exportStart(
    entityType: String!
    fileFormat: String
    filters: JSON
    ids: [String]
    selectedFields: [String]
  ): Export
  exportCancel(exportId: String!): Export
  exportRetry(exportId: String!): Export
`;
