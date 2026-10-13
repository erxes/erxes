import { gql } from '~/gql';

export const GET_ACCOUNTS_MAIN = gql(`
query accountingAccountsMain($status: String, $categoryId: String, $currency: String, $searchValue: String, $brand: String, $ids: [String], $excludeIds: Boolean, $isTemp: Boolean, $isOutBalance: Boolean, $branchId: String, $departmentId: String, $journal: String, $journals: [String], $kind: String, $code: String, $name: String, $permissionMode: String, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
  accountsMain(
    status: $status
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
    permissionMode: $permissionMode
    cursor: $cursor
    cursorMode: $cursorMode
    direction: $direction
    limit: $limit
  ) {
    list {
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
    totalCount
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);

export const GET_ACCOUNTS = gql(`
query accountingAccounts($status: String, $categoryId: String, $currency: String, $searchValue: String, $brand: String, $ids: [String], $excludeIds: Boolean, $isTemp: Boolean, $isOutBalance: Boolean, $branchId: String, $departmentId: String, $journal: String, $journals: [String], $kind: String, $code: String, $name: String, $permissionMode: String, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
  accountsMain(
    status: $status
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
    permissionMode: $permissionMode
    cursor: $cursor
    cursorMode: $cursorMode
    direction: $direction
    limit: $limit
  ) {
    list {
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
    }
    totalCount
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);

export const GET_ACCOUNT_DETAIL = gql(`
query accountingAccountDetail($id: String!) {
  accountDetail(_id: $id) {
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

export const GET_ASSIGNED_ACCOUNTS = gql(`
query accountingAssignedAccounts($ids: [String], $permissionMode: String) {
  accounts(ids: $ids, permissionMode: $permissionMode) {
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
  }
}
`);
