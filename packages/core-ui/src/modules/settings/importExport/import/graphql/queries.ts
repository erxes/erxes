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

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config)
  }
`;

const importHistories = `
  query importHistories($type: String, $perPage: Int, $page: Int) {
    importHistories(type: $type, perPage: $perPage, page: $page) {
      list {
         _id
        success
        failed
        total
        updated
        name
        contentTypes 
        date
        status
        percentage
        attachments
        removed
        user {
          _id
          details {
            fullName
          }
        }
        error
        }
      count 
    }
  }
`;

export default {
  importHistories,
  importHistoryGetColumns,
  importHistoryGetDuplicatedHeaders,
  fieldsCombinedByContentType
};
