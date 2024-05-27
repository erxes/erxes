import { IAccount } from '../../types/IAccount';
import { IAccountCategory } from '../../types/IAccountCategory';

export interface IAccountsResponse {
  accounts: IAccount[];
}

export interface IAccountsTotalCountResponse {
  accountsTotalCount: number;
}

export interface IAccountCategoryResponse {
  accountCategories: IAccountCategory[];
}

export interface IAccountCategoriesTotalCountResponse {
  accountCategoriesTotalCount: number;
}

const accounts = `
  query accounts($accountsStatus: String, $categoryId: String, $searchValue: String, $brand: String, $ids: [String], $excludeIds: Boolean, $isOutBalance: Boolean, $branchId: String, $accountsCurrency2: String, $departmentId: String, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
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

const accountsTotalCount = `
  query accountsTotalCount($status: String, $categoryId: String, $searchValue: String, $brand: String, $ids: [String], $excludeIds: Boolean, $isOutBalance: Boolean, $branchId: String, $departmentId: String, $currency: String) {
    accountsTotalCount(status: $status, categoryId: $categoryId, searchValue: $searchValue, brand: $brand, ids: $ids, excludeIds: $excludeIds, isOutBalance: $isOutBalance, branchId: $branchId, departmentId: $departmentId, currency: $currency)
  }
`;

const accountCategories = `
  query accountCategories($accountCategoriesParentId2: String, $withChild: Boolean, $searchValue: String, $status: String, $meta: String, $brand: String) {
    accountCategories(parentId: $accountCategoriesParentId2, withChild: $withChild, searchValue: $searchValue, status: $status, meta: $meta, brand: $brand) {
      _id
      accountCount
      description
      code
      isRoot
      mask
      maskType
      name
      order
      parentId
      scopeBrandIds
      status
    }
  }
`;

const accountCategoriesTotalCount = `
  query accountCategoriesTotalCount($parentId: String, $withChild: Boolean, $searchValue: String, $status: String, $meta: String) {
    accountCategoriesTotalCount(parentId: $parentId, withChild: $withChild, searchValue: $searchValue, status: $status, meta: $meta)
  }
`;

export const accountQuery = {
  accounts,
  accountsTotalCount,
  accountCategories,
  accountCategoriesTotalCount
};
