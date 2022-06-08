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

const importHistoryGetTypes = `
  query importHistoryGetTypes {
    importHistoryGetTypes
  }
`;

const importHistoryGetExportableServices = `
  query importHistoryGetExportableServices {
    importHistoryGetExportableServices
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
        user 
        error
        }
      count 
    }
  }
`;

export default {
  importHistoryGetExportableServices,
  importHistoryGetTypes,
  importHistories,
  importHistoryGetColumns,
  importHistoryGetDuplicatedHeaders
};
