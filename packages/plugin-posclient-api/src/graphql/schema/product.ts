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
    barcodes: [String]
    barcodeDescription: String
    unitPrice: Float
    categoryId: String
    customFieldsData: JSON
    createdAt: Date
    tagIds: [String]
    vendorId: String
    attachmentMore: [Attachment]
    supply: String
    productCount: Int
    minimiumCount: Int
    uomId: String
    subUoms: JSON
    category: PosProductCategory
    remainder: Int
  }
`;

const productsQueryParams = `
  type: String,
  categoryId: String,
  searchValue: String,
  tag: String,
  page: Int,
  perPage: Int ids: [String],
  sortField: String,
  sortDirection: Int,
  excludeIds: Boolean,
  segment: String,
  segmentData: String,
`;

export const queries = `
  poscProductCategories(parentId: String, searchValue: String, excludeEmpty: Boolean): [PosProductCategory]
  poscProductCategoriesTotalCount(parentId: String, searchValue: String): Int
  poscProductCategoryDetail(_id: String): PosProductCategory

  poscProducts(
    ${productsQueryParams}
    page: Int,
    perPage: Int,
  ): [PoscProduct]
  poscProductsTotalCount(
    ${productsQueryParams}
  ): Int
  poscProductDetail(_id: String): PoscProduct
`;
