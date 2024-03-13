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

const syncMsdHistories = `
  query syncMsdHistories(
    ${commonHistoryParams}
  ) {
    syncMsdHistories (
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
      responseData
      responseStr
      error

      content
      createdUser
    }
  }
`;

const syncMsdHistoriesCount = `
  query syncMsdHistoriesCount(
    ${commonHistoryParams}
  ) {
    syncMsdHistoriesCount (
      ${commonHistoryParamDefs}
    )
  }
`;

const dynamicConfigs = `
  query msdynamicConfigs {
    msdynamicConfigs {
      _id
      endPoint
      username
      password
    }
  }
`;

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export default {
  syncMsdHistories,
  syncMsdHistoriesCount,
  dynamicConfigs,
  configs,
};
