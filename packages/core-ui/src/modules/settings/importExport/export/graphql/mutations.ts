const exportHistoriesCreate = `
  mutation exportHistoriesCreate($contentType: String!, $columnsConfig: [String], $segmentData: JSON, $name: String) {
    exportHistoriesCreate(contentType: $contentType, columnsConfig: $columnsConfig, segmentData: $segmentData, name: $name) 
  }
`;

export default {
  exportHistoriesCreate
};
