const exportHistoriesCreate = `
  mutation exportHistoriesCreate($contentType: String!, $columnsConfig: JSON, $segmentData: JSON, $exportName: String, $disclaimer: Boolean) {
    exportHistoriesCreate(contentType: $contentType, columnsConfig: $columnsConfig, segmentData: $segmentData, exportName: $exportName, disclaimer: $disclaimer) 
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
