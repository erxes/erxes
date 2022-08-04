const importHistoryPreviewExportCount = `
  query importHistoryPreviewExportCount($segmentId: String, $contentType: String!) {
    importHistoryPreviewExportCount(segmentId: $segmentId, contentType: $contentType)
  }
`;

export default {
  importHistoryPreviewExportCount
};
