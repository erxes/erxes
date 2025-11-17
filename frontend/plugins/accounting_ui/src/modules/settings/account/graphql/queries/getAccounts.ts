import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const ACCOUNT_MINI_FIELDS = `
  _id
  code
  name
  status
  currency
  kind
  journal
  branchId
  departmentId
  isTemp
  isOutBalance
`;

export const ACCOUNT_FIELDS = `
  ${ACCOUNT_MINI_FIELDS}

  description
  categoryId
  parentId
  createdAt
  scopeBrandIds
`;

const ACCOUNT_PARAM_DEFS = `
  $accountsStatus: String
  $categoryId: String
  $currency: String
  $searchValue: String
  $brand: String
  $ids: [String]
  $excludeIds: Boolean
  $isTemp: Boolean
  $isOutBalance: Boolean
  $branchId: String
  $departmentId: String
  $journal: String
  $journals: [String]
  $kind: String
  $code: String
  $name: String
  ${GQL_CURSOR_PARAM_DEFS}
`;

const ACCOUNT_PARAMS = `
  status: $accountsStatus
  categoryId: $categoryId
  searchValue: $searchValue
  brand: $brand
  ids: $ids
  excludeIds: $excludeIds
  isTemp: $isTemp
  isOutBalance: $isOutBalance
  branchId: $branchId
  currency: $currency
  departmentId: $departmentId
  journal: $journal
  journals: $journals
  kind: $kind
  code: $code
  name: $name
  ${GQL_CURSOR_PARAMS}
`

export const GET_ACCOUNTS_MAIN = gql`
  query AccountsMain(
    ${ACCOUNT_PARAM_DEFS}
  ) {
    accountsMain(
      ${ACCOUNT_PARAMS}
    ) {
      list {
        ${ACCOUNT_FIELDS}
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query Accounts(
    ${ACCOUNT_PARAM_DEFS}
  ) {
    accountsMain(
      ${ACCOUNT_PARAMS}
    ) {
      list {
        ${ACCOUNT_MINI_FIELDS}
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_ACCOUNT_DETAIL = gql`
  query accountDetail($id: String) {
    accountDetail(_id: $id) {
      ${ACCOUNT_FIELDS}
    }
  }
`;

export const GET_ASSIGNED_ACCOUNTS = gql`
  query AssignedAccounts($ids: [String]) {
    accounts(ids: $ids) {
      ${ACCOUNT_MINI_FIELDS}
    }
  }
`;
