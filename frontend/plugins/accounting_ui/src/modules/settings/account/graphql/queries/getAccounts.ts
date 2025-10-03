import { gql } from '@apollo/client';

export const ACCOUNT_FIELDS = `
  _id
  code
  name
  status
  currency
  kind
  journal
  description
  categoryId
  branchId
  departmentId
  isTemp
  isOutBalance
  parentId
  createdAt
  scopeBrandIds
`;

export const GET_ACCOUNTS = gql`
  query accounts(
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
    $journals: [String]
    $kind: String
    $code: String
    $name: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    accounts(
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
      journals: $journals
      kind: $kind
      code: $code
      name: $name
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${ACCOUNT_FIELDS}
    }
    accountsCount(
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
      journals: $journals
      kind: $kind
      code: $code
      name: $name
    )
  }
`;

export const GET_ACCOUNT_DETAIL = gql`
  query accountDetail($id: String) {
    accountDetail(_id: $id) {
      ${ACCOUNT_FIELDS}
    }
  }
`;
