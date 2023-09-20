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
    meta: String
    order: String!
    isRoot: Boolean
    productCount: Int
  }

  type PoscProduct {
    ${commonFieldDefs}
    type: String
    barcodes: [String]
    barcodeDescription: String
    unitPrice: Float
    categoryId: String
    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    createdAt: Date
    tagIds: [String]
    vendorId: String
    attachmentMore: [Attachment]
    uom: String
    subUoms: JSON
    category: PosProductCategory
    remainder: Float
    remainders: [JSON]
    isCheckRem: Boolean
  }
`;

const productsQueryParams = `
  type: String,
  categoryId: String,
  searchValue: String,
  tag: String,
  ids: [String],
  excludeIds: Boolean,
  segment: String,
  segmentData: String,
  isKiosk: Boolean,
`;

const productCategoriesParams = `
  parentId: String,
  withChild: Boolean,
  searchValue: String,
  status: String,
  excludeEmpty: Boolean,
  meta: String,
  isKiosk: Boolean,
`;
const commonParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const queries = `
  poscProductCategories(
    ${productCategoriesParams}
    ${commonParams}
  ): [PosProductCategory]
  poscProductCategoriesTotalCount(${productCategoriesParams}): Int
  poscProductCategoryDetail(_id: String): PosProductCategory

  poscProducts(
    ${productsQueryParams}
    ${commonParams}
  ): [PoscProduct]
  poscProductsTotalCount(
    ${productsQueryParams}
  ): Int
  poscProductDetail(_id: String, branchId: String): PoscProduct
  getPriceInfo(productId: String!): String
`;
