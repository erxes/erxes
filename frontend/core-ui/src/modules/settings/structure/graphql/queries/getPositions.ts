import { gql } from '@apollo/client';

const GET_POSITIONS_LIST = gql`
  query Positions(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $onlyFirstLevel: Boolean
    $parentId: String
    $sortField: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    positionsMain(
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      status: $status
      onlyFirstLevel: $onlyFirstLevel
      parentId: $parentId
      sortField: $sortField
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      list {
        _id
        code
        title
        parentId
        userCount
        userIds
        order
        status
      }
      totalCount
    }
  }
`;

const GET_POSITION_DETAILS_BY_ID = gql`
  query PositionDetail($id: String) {
    positionDetail(_id: $id) {
      _id
      code
      order
      parentId
      status
      title
      userIds
    }
  }
`;

export { GET_POSITIONS_LIST, GET_POSITION_DETAILS_BY_ID };
