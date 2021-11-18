const importHistoriesCreate = `
  mutation importHistoriesCreate($contentType: String, $file: JSON, $columnsConfig: JSON, $importName: String) {
    importHistoriesCreate(contentType: $contentType, file: $file, columnsConfig: $columnsConfig, importName: $importName)
  }
`;

export default {
  importHistoriesCreate
};
