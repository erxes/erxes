import { gql } from '@apollo/client';

export const productGroupFields = `
  _id
  mainProductId
  subProductId
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
  sortNum
  ratio
  isActive
`;
export const SELECT_PRODUCT_GROUP = gql`
  query SelectProductGroups(
    $status: String
    $name: String
    $number: String
    $searchValue: String
    $ids: [String]
    $excludeIds: Boolean
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    ebarimtProductGroups(
      status: $status
      name: $name
      number: $number
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${productGroupFields}
    }
    ebarimtProductGroupsCount(
      status: $status
      name: $name
      number: $number
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
    )
  }
`;
export const GET_PRODUCT_GROUP = gql`
  query EbarimtProductGroups(
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
`;
export const GET_PRODUCT_GROUP_VALUE = gql`
  query ProductGroupDetail($id: String) {
    productGroupDetail(_id: $id) {
      _id
      name
      number
      percent
    }
  }
`;
