import { IAccount } from "../../types/IAccount";

export interface IAccountsResponse {
  accounts:IAccount[]
}

const accounts = `
query Accounts($accountsStatus: String, $categoryId: String, $searchValue: String, $brand: String, $ids: [String], $excludeIds: Boolean, $isOutBalance: Boolean, $branchId: String, $accountsCurrency2: String, $departmentId: String, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
    accounts(status: $accountsStatus, categoryId: $categoryId, searchValue: $searchValue, brand: $brand, ids: $ids, excludeIds: $excludeIds, isOutBalance: $isOutBalance, branchId: $branchId, currency: $accountsCurrency2, departmentId: $departmentId, page: $page, perPage: $perPage, sortField: $sortField, sortDirection: $sortDirection) {
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
      isOutBalance
      parentId
      createdAt
      scopeBrandIds
      category {
        _id
        name
        description
        parentId
        code
        order
        scopeBrandIds
        status
        isRoot
        accountCount
        maskType
        mask
      }
    }
  }
`;

export const accountQuery = {
    accounts
}
