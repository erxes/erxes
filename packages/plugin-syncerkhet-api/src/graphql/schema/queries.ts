const productsQueryParams = `
  productIds: [String]
  stageId: String
  pipelineId: String
`;

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

export const queries = `
  erkhetRemainders(
    ${productsQueryParams}
  ): [erkhetRemainder]  
  syncHistories(${commonHistoryParams}): [SyncHistory]
  syncHistoriesCount(${commonHistoryParams}): Int
  erkhetDebt(contentType: String!, contentId: String!, startDate: Date, endDate: Date, isMore: Boolean): JSON
`;
