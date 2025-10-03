import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_UNITS_MAIN = gql`
  query unitsMain(
    $searchValue: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    unitsMain(
      searchValue: $searchValue
      ${GQL_CURSOR_PARAMS}
    ) {
      list{
        _id
        title
        code
        userCount
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_UNIT_BT_ID = gql`
  query unitDetail($_id: String!) {
    unitDetail(_id: $_id) {
      _id
      title
      code
    }
  }
`;
