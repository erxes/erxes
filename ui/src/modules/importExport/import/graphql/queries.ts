const importHistoryGetColumns = `
  query importHistoryGetColumns($attachmentName: String) {
    importHistoryGetColumns(attachmentName: $attachmentName)
  }
`;

const importHistoryGetDuplicatedHeaders = `
  query importHistoryGetDuplicatedHeaders($attachmentNames: [String]) {
    importHistoryGetDuplicatedHeaders(attachmentNames: $attachmentNames)
  }
`;

export default {
  importHistoryGetColumns,
  importHistoryGetDuplicatedHeaders
};
