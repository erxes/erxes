import { gql } from '~/gql';

export const ACCOUNTS_ADD = gql(`
mutation accountingAccountsAdd($code: String, $name: String, $categoryId: String, $parentId: String, $currency: String, $kind: String, $journal: String, $description: String, $branchId: String, $departmentId: String, $isTemp: Boolean, $isOutBalance: Boolean, $scopeBrandIds: [String], $extra: JSON, $status: String) {
  accountsAdd(
    code: $code
    name: $name
    categoryId: $categoryId
    parentId: $parentId
    currency: $currency
    kind: $kind
    journal: $journal
    description: $description
    branchId: $branchId
    departmentId: $departmentId
    isTemp: $isTemp
    isOutBalance: $isOutBalance
    scopeBrandIds: $scopeBrandIds
    extra: $extra
    status: $status
  ) {
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
    extra {
      bank
      bankAccount
    }
    description
    categoryId
    parentId
    createdAt
    scopeBrandIds
  }
}
`);

export const ACCOUNTS_EDIT = gql(`
mutation accountingAccountsEdit($_id: String!, $code: String, $name: String, $categoryId: String, $parentId: String, $currency: String, $kind: String, $journal: String, $description: String, $branchId: String, $departmentId: String, $isTemp: Boolean, $isOutBalance: Boolean, $scopeBrandIds: [String], $extra: JSON, $status: String) {
  accountsEdit(
    _id: $_id
    code: $code
    name: $name
    categoryId: $categoryId
    parentId: $parentId
    currency: $currency
    kind: $kind
    journal: $journal
    description: $description
    branchId: $branchId
    departmentId: $departmentId
    isTemp: $isTemp
    isOutBalance: $isOutBalance
    scopeBrandIds: $scopeBrandIds
    extra: $extra
    status: $status
  ) {
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
    extra {
      bank
      bankAccount
    }
    description
    categoryId
    parentId
    createdAt
    scopeBrandIds
  }
}
`);

export const ACCOUNTS_REMOVE = gql(`
mutation accountingAccountsRemove($accountIds: [String!]!) {
  accountsRemove(accountIds: $accountIds)
}
`);

export const ACCOUNTS_MERGE = gql(`
mutation accountingAccountsMerge($accountIds: [String!]!, $accountFields: JSON!) {
  accountsMerge(accountIds: $accountIds, accountFields: $accountFields) {
    _id
  }
}
`);
