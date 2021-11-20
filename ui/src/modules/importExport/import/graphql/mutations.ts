const importHistoriesCreate = `
  mutation importHistoriesCreate($contentType: String, $file: JSON, $columnsConfig: JSON, $importName: String, $tagId: String) {
    importHistoriesCreate(contentType: $contentType, file: $file, columnsConfig: $columnsConfig, importName: $importName, tagId: $tagId)
  }
`;

export default {
  importHistoriesCreate
};
