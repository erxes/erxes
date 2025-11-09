import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

const productsQueryParams = `
  productIds: [String]
  stageId: String
  pipelineId: String
  posId: String
  accountCodes: String
  locationCodes: String
`;

const commonHistoryParams = `
  userId: String,
  startDate: Date,
  endDate: Date,
  contentType: String,
  contentId: String,
  searchConsume: String,
  searchSend: String,
  searchResponse: String,
  searchError: String,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  erkhetRemainders(${productsQueryParams}): [erkhetRemainder]  
  syncHistories(${commonHistoryParams}): SyncHistoryListResponse
  syncHistoriesCount(${commonHistoryParams}): Int
  erkhetDebt(contentType: String!, contentId: String!, startDate: Date, endDate: Date, isMore: Boolean): JSON
`;
