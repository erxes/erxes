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

  type ProductCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    description: String
    meta: String
    parentId: String
    code: String!
    order: String!
    attachment: Attachment
    status: String
    isRoot: Boolean
    productCount: Int
  }

  type Product @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    code: String
    type: String
    description: String
    barcodes: [String]
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
    uom: String
    subUoms: JSON

    category: ProductCategory
    ${contactsAvailable ? 'vendor: Company' : ''}
    taxType: String
    taxCode: String

  }
`;

const productParams = `
  name: String,
  categoryId: String,
  type: String,
  description: String,
  barcodes: [String],
  barcodeDescription: String,
  unitPrice: Float,
  code: String,
  customFieldsData: JSON,
  attachment: AttachmentInput,
  attachmentMore: [AttachmentInput],
  vendorId: String,
  uom: String,
  subUoms: JSON,
  taxType: String,
  taxCode: String,
`;

const productCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  meta: String,
  parentId: String,
  attachment: AttachmentInput,
  status: String
`;

const productsQueryParams = `
  type: String,
  categoryId: String,
  searchValue: String,
  tag: String,
  ids: [String],
  page: Int,
  perPage: Int,
  sortField: String
  sortDirection: Int
  excludeIds: Boolean,
  pipelineId: String,
  boardId: String,
  segment: String,
  segmentData: String,
`;

export const queries = `
  productCategories(parentId: String, searchValue: String, status: String, meta: String): [ProductCategory]
  productCategoriesTotalCount: Int
  productCategoryDetail(_id: String): ProductCategory
  products(
    ${productsQueryParams},
    perPage: Int,
    page: Int
  ): [Product]
  productsTotalCount(${productsQueryParams}): Int
  productsGroupCounts(only: String, segment: String, segmentData: String): JSON
  productDetail(_id: String): Product
  productCountByTags: JSON
`;

export const mutations = `
  productsAdd(${productParams}): Product
  productsEdit(_id: String!, ${productParams}): Product
  productsRemove(productIds: [String!]): String
  productsMerge(productIds: [String], productFields: JSON): Product
  productCategoriesAdd(${productCategoryParams}): ProductCategory
  productCategoriesEdit(_id: String!, ${productCategoryParams}): ProductCategory
  productCategoriesRemove(_id: String!): JSON
`;
