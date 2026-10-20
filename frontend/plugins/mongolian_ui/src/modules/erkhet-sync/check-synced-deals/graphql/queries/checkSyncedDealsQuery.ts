import { gql } from '~/gql';

export const checkSyncedDealsQuery = gql(`
  query erkhetCheckSyncedDeals(
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
    $userIds: [String]
    $stageId: String
    $stageChangedStartDate: Date
    $stageChangedEndDate: Date
    $startDate: String
    $endDate: String
    $createdStartDate: Date
    $createdEndDate: Date
    $noSkipArchive: Boolean
    $productIds: [String]
    $search: String
    $number: String
  ) {
    deals(
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
      userIds: $userIds
      stageId: $stageId
      stageChangedStartDate: $stageChangedStartDate
      stageChangedEndDate: $stageChangedEndDate
      startDate: $startDate
      endDate: $endDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      noSkipArchive: $noSkipArchive
      productIds: $productIds
      search: $search
      number: $number
    ) {
      list {
        _id
        name
        amount
        number
        createdAt
        stageChangedDate
        __typename
        modifiedAt
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
`);
