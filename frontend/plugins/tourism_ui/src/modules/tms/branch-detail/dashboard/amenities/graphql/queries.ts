import { gql } from '@apollo/client';

export const GET_AMENITIES = gql`
  query BmsElements(
    $branchId: String
    $name: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $quick: Boolean
  ) {
    bmsElements(
      branchId: $branchId
      name: $name
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      quick: $quick
    ) {
      list {
        _id
        name
        icon
        quick
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
