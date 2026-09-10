import {
  GQL_CURSOR_PARAMS,
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

import { gql } from '@apollo/client';

export const GET_CUSTOMERS = gql`
  query customers(
    $searchValue: String
    ${GQL_CURSOR_PARAM_DEFS}
    $ids: [String]
    $emailValidationStatus: String
  ) {
    customers(
      searchValue: $searchValue
      ${GQL_CURSOR_PARAMS}
      ids: $ids
      emailValidationStatus: $emailValidationStatus
    ) {
      list {
        _id
        firstName
        middleName
        lastName
        avatar
        primaryEmail
        emails
        emailValidationStatus
        primaryPhone
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;
