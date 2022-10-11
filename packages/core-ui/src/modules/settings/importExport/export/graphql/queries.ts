const exportHistoryGetDuplicatedHeaders = `
  query exportHistoryGetDuplicatedHeaders($attachmentNames: [String]) {
    exportHistoryGetDuplicatedHeaders(attachmentNames: $attachmentNames)
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config)
  }
`;

const exportHistories = `
  query exportHistories($type: String, $perPage: Int, $page: Int) {
    exportHistories(type: $type, perPage: $perPage, page: $page) {
      list {
         _id
        total
        name
        contentType
        date
        status
        user {
          details {
            fullName
          }
        }
        exportLink
        }
      count 
    }
  }
`;

export default {
  exportHistories,
  exportHistoryGetDuplicatedHeaders,
  fieldsCombinedByContentType
};
