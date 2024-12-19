export const types = () => `
  type AccountCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    description: String
    parentId: String
    code: String!
    order: String!
    scopeBrandIds: [String]
    status: String
    isRoot: Boolean
    accountCount: Int
    maskType: String
    mask: JSON

    parent: AccountCategory
  }

  type Account @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    code: String
    name: String
    status: String
    currency: String
    kind: String
    journal: String
    description: String
    categoryId: String
    branchId: String
    departmentId: String
    isOutBalance: Boolean
    parentId: String
    createdAt: Date
    scopeBrandIds: [String]
    
    category: AccountCategory
  }
`;

const accountParams = `
  code: String,
  name: String,
  categoryId: String,
  parentId: String,
  currency: String,
  kind: String,
  journal: String,
  description: String,
  branchId: String,
  departmentId: String,
  isOutBalance: Boolean,
  scopeBrandIds: [String]
`;

const accountCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  scopeBrandIds: [String]
  status: String
  maskType: String
  mask: JSON
`;

const accountsQueryParams = `
  status: String,
  categoryId: String,
  searchValue: String,
  brand: String
  ids: [String],
  excludeIds: Boolean,
  isOutBalance: Boolean,
  branchId: String
  departmentId: String
  currency: String
  journals: [String]
  kind: String
  code: String
  name: String
`;

export const queries = `
  accountCategories(parentId: String, withChild: Boolean, searchValue: String, status: String, meta: String, brand: String): [AccountCategory]
  accountCategoriesTotalCount(parentId: String, withChild: Boolean, searchValue: String, status: String, meta: String): Int
  accountCategoryDetail(_id: String!): AccountCategory
  accounts(
    ${accountsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int    
  ): [Account]
  accountsCount(${accountsQueryParams}): Int
  accountDetail(_id: String): Account
`;

export const mutations = `
  accountsAdd(${accountParams}): Account
  accountsEdit(_id: String!, ${accountParams}): Account
  accountsRemove(accountIds: [String!]): String
  accountsMerge(accountIds: [String], accountFields: JSON): Account
  accountCategoriesAdd(${accountCategoryParams}): AccountCategory
  accountCategoriesEdit(_id: String!, ${accountCategoryParams}): AccountCategory
  accountCategoriesRemove(_id: String!): JSON
`;
