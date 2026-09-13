export const types = `
  type ImportColumnMapping {
    index: Int
    header: String
    key: String
  }

  input ImportColumnMappingInput {
    index: Int!
    header: String
    key: String!
  }

  type ImportPreviewColumn {
    index: Int
    header: String
    key: String
    confidence: Float
    status: String
    sampleValues: [String]
  }

  type ImportPreviewField {
    key: String
    label: String
    type: String
    dataType: String
    options: [String]
    example: String
    required: Boolean
  }

  type ImportColumnPreview {
    columns: [ImportPreviewColumn]
    fields: [ImportPreviewField]
    totalRows: Int
  }

  type Import {
    _id: String
    entityType: String
    pluginName: String
    moduleName: String
    collectionName: String
    fileKey: String
    fileName: String
    columnMapping: [ImportColumnMapping]
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
  importColumnPreview(
    entityType: String!
    fileKey: String!
    fileName: String!
  ): ImportColumnPreview
  importFields(entityType: String!): [ImportPreviewField]
  activeImports(entityType: String): [Import]
  importHistories(
    entityType: String
    entityTypes: [String]
    status: String
    limit: Int
    cursor: String
    direction: CURSOR_DIRECTION
    cursorMode: CURSOR_MODE
  ): ImportHistoryList
`;

export const mutations = `
  importStart(
    entityType: String!
    fileKey: String!
    fileName: String!
    columnMapping: [ImportColumnMappingInput]
  ): Import
  importCancel(importId: String!): Import
  importRetry(importId: String!): Import
  importResume(importId: String!): Import
`;
