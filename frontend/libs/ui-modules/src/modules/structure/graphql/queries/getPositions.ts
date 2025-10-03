import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_POSITIONS_QUERY = gql`
  query Positions(
    $ids: [String]
    $searchValue: String
    $status: String
    $onlyFirstLevel: Boolean
    $parentId: String
    $sortField: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    positionsMain(
      ids: $ids
      searchValue: $searchValue
      status: $status
      onlyFirstLevel: $onlyFirstLevel
      parentId: $parentId
      sortField: $sortField
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        children {
          _id
          code
          title
          userCount
        }
        code
        order
        parentId
        status
        title
        userCount
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_POSITION_BY_ID = gql`
  query PositionDetail($id: String) {
    positionDetail(_id: $id) {
      _id
      code
      order
      parentId
      status
      title
      userCount
      children {
        _id
        code
        title
        userCount
      }
    }
  }
`;
