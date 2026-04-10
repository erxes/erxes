export const types = `
  enum ImportExportOperation {
    IMPORT
    EXPORT
  }

  type ImportExportType {
    label: String!
    contentType: String!
  }
`;

export const queries = `
  importExportTypes(operation: ImportExportOperation!): [ImportExportType!]!
`;
