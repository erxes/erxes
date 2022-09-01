const exportHistoryGetColumns = `
  query exportHistoryGetColumns($attachmentName: String) {
    importHistoryGetColumns(attachmentName: $attachmentName)
  }
`;

const exportHistoryGetDuplicatedHeaders = `
  query exportHistoryGetDuplicatedHeaders($attachmentNames: [String]) {
    exportHistoryGetDuplicatedHeaders(attachmentNames: $attachmentNames)
  }
`;

const exportHistoryGetTypes = `
  query exportHistoryGetTypes {
    exportHistoryGetTypes
  }
`;

const exportHistoryGetExportableServices = `
  query exportHistoryGetExportableServices {
    exportHistoryGetExportableServices
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
        success
        total
        name
        contentTypes 
        date
        status
        percentage
        attachments
        removed
        user 
        error
        }
      count 
    }
  }
`;

export default {
  exportHistoryGetExportableServices,
  exportHistoryGetTypes,
  exportHistories,
  exportHistoryGetColumns,
  exportHistoryGetDuplicatedHeaders,
  fieldsCombinedByContentType
};
