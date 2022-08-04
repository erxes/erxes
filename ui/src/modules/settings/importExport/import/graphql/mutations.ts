const importHistoriesCreate = `
  mutation importHistoriesCreate($contentTypes: [String], $files: JSON, $columnsConfig: JSON, $importName: String, $associatedContentType: String, $associatedField: String) {
    importHistoriesCreate(contentTypes: $contentTypes, files: $files, columnsConfig: $columnsConfig, importName: $importName,  associatedContentType: $associatedContentType, associatedField: $associatedField)
  }
`;

const importHistoriesRemove = `
  mutation importHistoriesRemove($_id: String!, $contentType: String!) {
    importHistoriesRemove(_id: $_id, contentType: $contentType)
  }
`;

export default {
  importHistoriesCreate,
  importHistoriesRemove
};
