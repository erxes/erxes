const exportHistoriesCreate = `
  mutation importHistoriesCreate($contentTypes: [JSON], $files: JSON, $columnsConfig: JSON, $importName: String, $associatedContentType: String, $associatedField: String) {
    importHistoriesCreate(contentTypes: $contentTypes, files: $files, columnsConfig: $columnsConfig, importName: $importName,  associatedContentType: $associatedContentType, associatedField: $associatedField)
  }
`;

const exportHistoriesRemove = `
  mutation exportHistoriesRemove($_id: String!, $contentType: String!) {
    exportHistoriesRemove(_id: $_id, contentType: $contentType)
  }
`;

export default {
  exportHistoriesCreate,
  exportHistoriesRemove
};
