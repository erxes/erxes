import { gql } from '@apollo/client';
import { ACCOUNT_FIELDS } from '../queries/getAccounts';

const accountInputParamsDefs = `
  $code: String,
  $name: String,
  $categoryId: String,
  $parentId: String,
  $currency: String,
  $kind: String,
  $journal: String,
  $description: String,
  $branchId: String,
  $departmentId: String,
  $isTemp: Boolean,
  $isOutBalance: Boolean,
  $scopeBrandIds: [String]
`;

const accountInputParams = `
  code: $code,
  name: $name,
  categoryId: $categoryId,
  parentId: $parentId,
  currency: $currency,
  kind: $kind,
  journal: $journal,
  description: $description,
  branchId: $branchId,
  departmentId: $departmentId,
  isTemp: $isTemp,
  isOutBalance: $isOutBalance,
  scopeBrandIds: $scopeBrandIds
`;

export const ACCOUNTS_ADD = gql`
  mutation accountsAdd(${accountInputParamsDefs}) {
    accountsAdd(${accountInputParams}) {
      ${ACCOUNT_FIELDS}
    }
  }
`;

export const ACCOUNTS_EDIT = gql`
  mutation accountsEdit($_id: String!${accountInputParamsDefs}) {
    accountsEdit(_id: $_id, ${accountInputParams}) {
      ${ACCOUNT_FIELDS}
    }
  }
`;

export const ACCOUNTS_REMOVE = gql`
  mutation accountsRemove($accountIds: [String!]) {
    accountsRemove(accountIds: $accountIds)
  }
`;

export const ACCOUNTS_MERGE = gql`
  mutation accountsMerge($accountIds: [String], $accountFields: JSON) {
    accountsMerge(accountIds: $accountIds, accountFields: $accountFields) {
      _id
    }
  }
`;
