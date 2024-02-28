import {
  attachmentInput,
  attachmentType,
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
    description: String
    meta: String
    parentId: String
    code: String!
    order: String!
    scopeBrandIds: [String]
    attachment: Attachment
    status: String
    isRoot: Boolean
    accountCount: Int
    maskType: String
    mask: JSON
    isSimilarity: Boolean
    similarities: JSON
  }

  type Account @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    shortName: String
    status: String
    code: String
    type: String
    description: String
    barcodes: [String]
    variants: JSON
    barcodeDescription: String
    unitPrice: Float
    categoryId: String
    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    createdAt: Date
    ${tagsAvailable ? `getTags: [Tag]` : ''}
    tagIds: [String]
    attachment: Attachment
    attachmentMore: [Attachment]
    vendorId: String
    scopeBrandIds: [String]
    uom: String
    subUoms: JSON

    category: AccountCategory
    ${contactsAvailable ? 'vendor: Company' : ''}
    taxType: String
    taxCode: String
    hasSimilarity: Boolean
  }

  type AccountSimilarityGroup {
    title: String
    fieldId: String
  }

  type AccountSimilarity {
    accounts: [Account],
    groups: [AccountSimilarityGroup],
  }
`;

const accountParams = `
  name: String,
  shortName: String,
  categoryId: String,
  type: String,
  description: String,
  barcodes: [String],
  variants: JSON,
  barcodeDescription: String,
  unitPrice: Float,
  code: String,
  customFieldsData: JSON,
  attachment: AttachmentInput,
  attachmentMore: [AttachmentInput],
  vendorId: String,
  scopeBrandIds: [String]
  uom: String,
  subUoms: JSON,
  taxType: String,
  taxCode: String,
`;

const accountCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  meta: String,
  parentId: String,
  scopeBrandIds: [String]
  attachment: AttachmentInput,
  status: String
  maskType: String
  mask: JSON
  isSimilarity: Boolean
  similarities: JSON
`;

const accountsQueryParams = `
  type: String,
  status: String,
  categoryId: String,
  searchValue: String,
  vendorId: String,
  brand: String
  tag: String,
  ids: [String],
  excludeIds: Boolean,
  pipelineId: String,
  boardId: String,
  segment: String,
  segmentData: String,
  groupedSimilarity: String,
`;

export const queries = `
  accountCategories(parentId: String, withChild: Boolean, searchValue: String, status: String, meta: String, brand: String): [AccountCategory]
  accountCategoriesTotalCount(parentId: String, withChild: Boolean, searchValue: String, status: String, meta: String): Int
  accountCategoryDetail(_id: String): AccountCategory
  accounts(
    ${accountsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int    
  ): [Account]
  accountsTotalCount(${accountsQueryParams}): Int
  accountsGroupCounts(only: String, segment: String, segmentData: String): JSON
  accountDetail(_id: String): Account
  accountCountByTags: JSON
  accountSimilarities(_id: String!, groupedSimilarity: String): AccountSimilarity
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
