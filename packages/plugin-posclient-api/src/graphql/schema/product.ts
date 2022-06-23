import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

const commonFieldDefs = `
  _id: String!
  name: String
  description: String
  attachment: Attachment
  code: String
`;

export const types = `
  ${attachmentType}
  ${attachmentInput}

  type PosProductCategory {
    ${commonFieldDefs}
    parentId: String
    order: String!
    isRoot: Boolean
    productCount: Int
  }

  type PoscProduct {
    ${commonFieldDefs}
    type: String
    sku: String
    unitPrice: Float
    categoryId: String
    customFieldsData: JSON
    createdAt: Date
    tagIds: [String]
    vendorId: String
    attachmentMore: Attachment
    category: PosProductCategory
  }
`;

export const queries = `
  poscProductCategories(parentId: String, searchValue: String, excludeEmpty: Boolean): [PosProductCategory]
  poscProductCategoriesTotalCount(parentId: String, searchValue: String): Int
  poscProductCategoryDetail(_id: String): PosProductCategory

  poscProducts(
    type: String,
    categoryId: String,
    searchValue: String,
    page: Int,
    perPage: Int,
  ): [PoscProduct]
  poscProductsTotalCount(
    type: String,
    categoryId: String,
    searchValue: String,
  ): Int
  poscProductDetail(_id: String): PoscProduct
`;
