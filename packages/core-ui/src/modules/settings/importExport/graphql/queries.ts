const importHistoryPreviewExportCount = `
  query importHistoryPreviewExportCount($segmentId: String, $contentType: String!) {
    importHistoryPreviewExportCount(segmentId: $segmentId, contentType: $contentType)
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config)
  }
`;

export default {
  importHistoryPreviewExportCount,
  fieldsCombinedByContentType
};
