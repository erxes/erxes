const exportHistoriesCreate = `
  mutation exportHistoriesCreate($contentType: String!, $columnsConfig: [String], $segmentId: String) {
    exportHistoriesCreate(contentType: $contentType, columnsConfig: $columnsConfig, segmentId: $segmentId)
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
