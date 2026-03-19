import { gql } from '@apollo/client';

export const GET_ELEMENTS = gql`
  query BmsElements(
    $branchId: String
    $categories: [String]
    $name: String
    $quick: Boolean
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
  ) {
    bmsElements(
      branchId: $branchId
      categories: $categories
      name: $name
      quick: $quick
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
    ) {
      list {
        _id
        categories
        cost
        content
        createdAt
        duration
        name
        note
        quick
        startTime
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
