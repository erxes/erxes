const importHistoriesCreate = `
  mutation importHistoriesCreate($contentTypes: [String], $files: JSON, $columnsConfig: JSON, $importName: String, $tagId: String) {
    importHistoriesCreate(contentTypes: $contentTypes, files: $files, columnsConfig: $columnsConfig, importName: $importName, tagId: $tagId)
  }
`;

export default {
  importHistoriesCreate
};
