import { gql } from '~/gql';

export const GET_PRODUCT_GROUP = gql(`
  query ebarimtProductGroups(
    $searchValue: String
    $productId: String
    $status: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    ebarimtProductGroups(
      searchValue: $searchValue
      productId: $productId
      status: $status
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
        createdAt
        modifiedAt
        modifiedBy
        mainProductId
        subProductId
        sortNum
        ratio
        isActive
        mainProduct {
          _id
          name
          code
        }
        subProduct {
          _id
          name
          code
        }
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
