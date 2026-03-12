import { gql } from '@apollo/client';

export const GET_ITINERARIES = gql`
  query BmsItineraries(
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $branchId: String
  ) {
    bmsItineraries(
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      branchId: $branchId
    ) {
      list {
        _id
        branchId
        name
        duration
        color
        createdAt
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
`;
