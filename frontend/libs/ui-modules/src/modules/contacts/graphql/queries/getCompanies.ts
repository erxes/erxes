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
        primaryPhone
        code
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_ASSIGNED_COMPANIES = gql`
  query assignedCompaniesSelect(
    $searchValue: String
    $ids: [String]
    $limit: Int
  ) {
    companies(searchValue: $searchValue, ids: $ids, limit: $limit) {
      list {
        _id
        avatar
        primaryName
        primaryEmail
        primaryPhone
        code
      }
    }
  }
`;
