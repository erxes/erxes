const importHistoryPreviewExportCount = `
  query importHistoryPreviewExportCount($segmentId: String, $contentType: String!) {
    importHistoryPreviewExportCount(segmentId: $segmentId, contentType: $contentType)
  }
`;
const exportHistoryPreviewExportCount = `
  query exportHistoryPreviewExportCount($segmentId: String, $contentType: String!) {
    exportHistoryPreviewExportCount(segmentId: $segmentId, contentType: $contentType)
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config)
  }
`;

const historyGetTypes = `
  query historyGetTypes {
    historyGetTypes
  }
`;

const historyGetExportableServices = `
  query historyGetExportableServices {
    historyGetExportableServices
  }
`;

export default {
  importHistoryPreviewExportCount,
  exportHistoryPreviewExportCount,
  fieldsCombinedByContentType,
  historyGetTypes,
  historyGetExportableServices
};
