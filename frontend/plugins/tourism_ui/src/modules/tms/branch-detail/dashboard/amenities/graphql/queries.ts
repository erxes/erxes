import { gql } from '@apollo/client';

export const GET_AMENITIES = gql`
  query BmsAmenities(
    $branchId: String
    $name: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $quick: Boolean
    $language: String
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
      language: $language
    ) {
      list {
        _id
        name
        icon
        quick
        language
        translations {
          _id
          language
          name
        }
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
