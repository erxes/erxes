const exportHistoriesCreate = `
  mutation exportHistoriesCreate($contentType: String!, $columnsConfig: [String], $segmentData: JSON, $exportName: String) {
    exportHistoriesCreate(contentType: $contentType, columnsConfig: $columnsConfig, segmentData: $segmentData, exportName: $exportName) 
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
