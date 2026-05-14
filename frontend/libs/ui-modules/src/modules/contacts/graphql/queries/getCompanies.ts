import {
  GQL_CURSOR_PARAMS,
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

import { gql } from '@apollo/client';
export const GET_COMPANIES = gql`
  query companies($searchValue: String, ${GQL_CURSOR_PARAM_DEFS} $ids: [String]) {
    companies(searchValue: $searchValue, ${GQL_CURSOR_PARAMS} ids: $ids) {
      list {
        _id
        avatar
        primaryName
        names
        primaryEmail
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_ASSIGNED_COMPANIES = gql`
  query assignedCompaniesSelect($searchValue: String) {
    companies(searchValue: $searchValue) {
      list {
        _id
        avatar
        primaryName
      }
    }
  }
`;
