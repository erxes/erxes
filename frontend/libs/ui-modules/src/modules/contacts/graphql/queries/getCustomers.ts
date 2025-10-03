import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const GET_CUSTOMERS = gql`
  query customers($searchValue: String ${GQL_CURSOR_PARAM_DEFS}) {
    customers(searchValue: $searchValue ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        firstName
        middleName
        lastName
        avatar
        primaryEmail
        primaryPhone
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;
