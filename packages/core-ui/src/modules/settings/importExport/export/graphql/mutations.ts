const exportHistoriesCreate = `
  mutation exportHistoriesCreate($contentTypes: [JSON], $files: JSON, $columnsConfig: JSON, $importName: String, $associatedContentType: String, $associatedField: String) {
    exportHistoriesCreate(contentTypes: $contentTypes, files: $files, columnsConfig: $columnsConfig, importName: $importName,  associatedContentType: $associatedContentType, associatedField: $associatedField)
  }
`;

const exportHistoriesRemove = `
  mutation exportHistoriesRemove($_id: String!, $contentType: String!) {
    exportHistoriesRemove(_id: $_id, contentType: $contentType)
  }
`;

const exportHistoryInfo = `
  query exportHistoryInformation($_id: String!, $contentType: String!) {
    exportHistoryInformation(_id: $_id, contentType: $contentType)
  }
`;

export default {
  exportHistoriesCreate,
  exportHistoriesRemove,
  exportHistoryInfo
};
