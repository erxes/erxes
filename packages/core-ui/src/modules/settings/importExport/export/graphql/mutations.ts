const exportHistoriesCreate = `
  mutation exportHistoriesCreate($contentType: String!, $columnsConfig: JSON, $segmentData: JSON, $name: String) {
    exportHistoriesCreate(contentType: $contentType, columnsConfig: $columnsConfig, segmentData: $segmentData, name: $name)
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
