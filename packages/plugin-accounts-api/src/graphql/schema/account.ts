import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = (tagsAvailable, contactsAvailable) => `
  ${attachmentType}
  ${attachmentInput}

  ${
    tagsAvailable
      ? `
        extend type Tag @key(fields: "_id") {
          _id: String! @external
        }
      `
      : ''
  }

  ${
    contactsAvailable
      ? `
        extend type Company @key(fields: "_id") {
          _id: String! @external
        }
      `
      : ''
  }

  type AccountCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    parentId: String
    code: String!
    order: String!
    status: String
    isRoot: Boolean
    customFieldsData: JSON
    accountCount: Int
  }

  type Account @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    code: String
    type: String
    categoryId: String
    createdAt: Date
    accountCount: Int
    currency:Float,
    isBalance: Boolean,
    closePercent: Float,
    journal: String,
    customFieldsDataByFieldCode: JSON
    category: AccountCategory
  }
`;

const accountParams = `
  name: String,
  categoryId: String,
  type: String,
  code: String,
  currency:Float,
  isBalance: Boolean,
  closePercent: Float,
  customFieldsData: JSON,
  journal: String,
  accountCount: Int
`;

const accountCategoryParams = `
  name: String!,
  code: String!,
  parentId: String,
  status: String,
`;

const accountsQueryParams = `
  type: String,
  categoryId: String,
  searchValue: String,
  tag: String,
  page: Int,
  perPage: Int ids: [String],
  excludeIds: Boolean,
  pipelineId: String,
  boardId: String,
  segment: String,
  segmentData: String,
`;

export const queries = `
  accountCategories(parentId: String, searchValue: String, status: String,): [AccountCategory]
  accountCategoriesTotalCount: Int
  accountCategoryDetail(_id: String): AccountCategory
  accounts(
    ${accountsQueryParams},
    perPage: Int,
    page: Int
  ): [Account]
  accountsTotalCount(${accountsQueryParams}): Int
  accountsGroupCounts(only: String, segment: String, segmentData: String): JSON
  accountDetail(_id: String): Account
  accountCountByTags: JSON
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
