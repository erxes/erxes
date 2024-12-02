export const accountFields = `
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
`;

const accountsFilterParamDefs = `
  $accountsStatus: String,
  $categoryId: String,
  $currency: String,
  $searchValue: String,
  $brand: String,
  $ids: [String],
  $excludeIds: Boolean,
  $isOutBalance: Boolean,
  $branchId: String,
  $departmentId: String,
  $journals: [String],
  $kind: String
  $code: String
  $name: String
`;
const accountsFilterParams = `
  status: $accountsStatus,
  categoryId: $categoryId,
  searchValue: $searchValue,
  brand: $brand,
  ids: $ids,
  excludeIds: $excludeIds,
  isOutBalance: $isOutBalance,
  branchId: $branchId,
  currency: $currency,
  departmentId: $departmentId,
  journals: $journals,
  kind: $kind
  code: $code
  name: $name
`;

const commonParamDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
  sortField: $sortField,
  sortDirection: $sortDirection
`;

const accounts = `
  query accounts(${accountsFilterParamDefs}, ${commonParamDefs}) {
    accounts(${accountsFilterParams}, ${commonParams}) {
      ${accountFields}
    }
  }
`;

const accountDetail = `
  query accountDetail($_id: String!) {
    accountDetail(_id: $_id) {
      ${accountFields}
    }
  }
`;

const accountsCount = `
  query accountsCount(${accountsFilterParamDefs}) {
    accountsCount(${accountsFilterParams})
  }
`;

// categories
export const categoryFields = `
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
`;

const categoryFilterParamDefs = `
  $accountCategoriesParentId: String,
  $withChild: Boolean,
  $searchValue: String,
  $status: String,
  $meta: String,
  $brand: String
`;

const categoryFilterParams = `
  parentId: $accountCategoriesParentId,
  withChild: $withChild,
  searchValue: $searchValue,
  status: $status,
  meta: $meta,
  brand: $brand
`;

const accountCategories = `
  query accountCategories(${categoryFilterParamDefs}) {
    accountCategories(${categoryFilterParams}) {
      ${categoryFields}
    }
  }
`;

const accountCategoryDetail = `
  query accountCategoryDetail($_id: String!) {
    accountCategoryDetail(_id: $_id) {
      ${categoryFields}
      parent {
        _id
        code
        name
      }
    }
  }
`;

const accountCategoriesTotalCount = `
  query accountCategoriesTotalCount(${categoryFilterParamDefs}) {
    accountCategoriesTotalCount(${categoryFilterParams})
  }
`;

export default {
  accounts,
  accountDetail,
  accountsCount,
  accountCategories,
  accountCategoryDetail,
  accountCategoriesTotalCount
};
