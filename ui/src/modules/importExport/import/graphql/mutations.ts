const importHistoriesCreate = `
  mutation importHistoriesCreate($contentTypes: [String], $files: JSON, $columnsConfig: JSON, $importName: String, associatedContentType: String, associatedField: String) {
    importHistoriesCreate(contentTypes: $contentTypes, files: $files, columnsConfig: $columnsConfig, importName: $importName,  associatedContentType: $associatedContentType, associatedField: $associatedField)
  }
`;

export default {
  importHistoriesCreate
};
