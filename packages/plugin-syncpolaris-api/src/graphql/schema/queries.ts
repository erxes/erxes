const commonHistoryParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
  userId: String,
  startDate: Date,
  endDate: Date,
  contentType: String,
  contentId: String,
  searchConsume: String,
  searchSend: String,
  searchResponse: String,
  searchError: String,
`;

const polarisData = `
  method: String,
  data: JSON
`;

export const queries = `
  syncHistoriesPolaris(${commonHistoryParams}): [SyncHistoryPolaris]
  syncHistoriesCountPolaris(${commonHistoryParams}): Int
  getPolarisData(${polarisData}): JSON

  pullPolarisConfigs(contentType: String) : JSON
  pullPolarisData(contentType: String, contentId: String, kind: String, codes: [String]) : JSON
`;
