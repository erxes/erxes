export const types = `
  enum ImportExportOperation {
    IMPORT
    EXPORT
  }

  type ImportExportType {
    label: String!
    contentType: String!
    permissions: [String!]!
  }
`;

export const queries = `
  importExportTypes(operation: ImportExportOperation!): [ImportExportType!]!
`;
