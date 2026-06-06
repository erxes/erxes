import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const ACCOUNT_PERMISSION_FIELDS = `
  _id
  userId
  accountId
  level
  read
  write
  createdAt
  updatedAt
  user {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  account {
    _id
    code
    name
    categoryId
    currency
    kind
    journal
    isTemp
    isOutBalance
    status
  }
`;

const PERMISSION_QUERY_PARAM_DEFS = `
  $userId: String
  $minLvl: Int
  $maxLvl: Int
  $reads: [String]
  $writes: [String]
  $searchValue: String
  $code: String
  $name: String
  $categoryId: String
  $currency: String
  $kind: String
  $journal: String
  $isTemp: Boolean
  $isOutBalance: Boolean
  $status: String
  ${GQL_CURSOR_PARAM_DEFS}
`;

const PERMISSION_QUERY_PARAMS = `
  userId: $userId
  minLvl: $minLvl
  maxLvl: $maxLvl
  reads: $reads
  writes: $writes
  searchValue: $searchValue
  code: $code
  name: $name
  categoryId: $categoryId
  currency: $currency
  kind: $kind
  journal: $journal
  isTemp: $isTemp
  isOutBalance: $isOutBalance
  status: $status
  ${GQL_CURSOR_PARAMS}
`;

export const GET_ACCOUNT_PERMISSIONS = gql`
  query AccountPermissions(
    ${PERMISSION_QUERY_PARAM_DEFS}
  ) {
    accountPermissions(
      ${PERMISSION_QUERY_PARAMS}
    ) {
      list {
        ${ACCOUNT_PERMISSION_FIELDS}
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;
