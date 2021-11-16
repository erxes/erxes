const importHistoryGetColumns = `
  query importHistoryGetColumns($attachmentName: String) {
    importHistoryGetColumns(attachmentName: $attachmentName)
  }
`;

export default {
  importHistoryGetColumns
};
