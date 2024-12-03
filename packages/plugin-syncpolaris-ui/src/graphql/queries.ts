const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;
const commonHistoryParams = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
  $userId: String,
  $startDate: Date,
  $endDate: Date,
  $contentType: String,
  $contentId: String,
  $searchConsume: String,
  $searchSend: String,
  $searchResponse: String,
  $searchError: String,
`;

const commonHistoryParamDefs = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userId: $userId,
  startDate: $startDate,
  endDate: $endDate,
  contentType: $contentType,
  contentId: $contentId,
  searchConsume: $searchConsume,
  searchSend: $searchSend,
  searchResponse: $searchResponse,
  searchError: $searchError,
`;

const syncHistoriesPolaris = `
  query syncHistoriesPolaris(
    ${commonHistoryParams}
  ) {
    syncHistoriesPolaris (
      ${commonHistoryParamDefs}
    ) {
      _id
      type
      contentType
      contentId
      createdAt
      createdBy
      consumeData
      consumeStr
      sendData
      sendStr
      header
      responseData
      responseStr
      error
      content
      createdUser
    }
  }
`;

const syncHistoriesCountPolaris = `
  query syncHistoriesCountPolaris(
    ${commonHistoryParams}
  ) {
    syncHistoriesCountPolaris (
      ${commonHistoryParamDefs}
    )
  }
`;

export default {
  configs,
  syncHistoriesPolaris,
  syncHistoriesCountPolaris,
  
};
