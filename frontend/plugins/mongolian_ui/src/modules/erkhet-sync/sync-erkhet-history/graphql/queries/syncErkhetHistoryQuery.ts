import { gql } from '@apollo/client';

export const syncErkhetHistoryQuery = gql`
  query SyncHistories(
    $userId: String
    $startDate: Date
    $endDate: Date
    $contentType: String
    $contentId: String
    $searchConsume: String
    $searchSend: String
    $searchResponse: String
    $searchError: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    syncHistories(
      userId: $userId
      startDate: $startDate
      endDate: $endDate
      contentType: $contentType
      contentId: $contentId
      searchConsume: $searchConsume
      searchSend: $searchSend
      searchResponse: $searchResponse
      searchError: $searchError
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
    ) {
      list {
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
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
