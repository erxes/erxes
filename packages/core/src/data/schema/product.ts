import {
  pdfAttachmentType,
  pdfAttachmentInput
} from "@erxes/api-utils/src/commonTypeDefs";

const productFields = `
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
    getTags: [Tag]
    tagIds: [String]
    attachment: Attachment
    attachmentMore: [Attachment]
    vendorId: String
    scopeBrandIds: [String]
    uom: String
    subUoms: JSON

    category: ProductCategory
    vendor: Company
    hasSimilarity: Boolean

    pdfAttachment: PdfAttachment
  `;

export const types = `
  ${pdfAttachmentType}
  ${pdfAttachmentInput}

  type ProductsConfig {
    _id: String!
    code: String!
    value: JSON
  }

  type ProductCategory @key(fields: "_id") {
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
    productCount: Int
    maskType: String
    mask: JSON
    isSimilarity: Boolean
    similarities: JSON
  }

  type Product @key(fields: "_id") {
    ${productFields}
  }

  type ProductsUsedPipeline {
    ${productFields}
    usedCount: Int
  }

  type ProductSimilarityGroup {
    title: String
    fieldId: String
  }

  type ProductSimilarity {
    products: [Product],
    groups: [ProductSimilarityGroup],
  }
`;

const productParams = `
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
  pdfAttachment: PdfAttachmentInput
`;

const productCategoryParams = `
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

const productsQueryParams = `
  type: String,
  status: String,
  categoryId: String,
  searchValue: String,
  vendorId: String,
  brand: String
  tag: String,
  ids: [String],
  excludeIds: Boolean,
  tags: [String]
  excludeTags: [String]
  tagWithRelated: Boolean
  pipelineId: String,
  boardId: String,
  segment: String,
  segmentData: String,
  groupedSimilarity: String,
  image: String,
`;

export const queries = `
  productCategories(ids:[String],parentId: String, withChild: Boolean, searchValue: String, status: String, meta: String, brand: String): [ProductCategory]
  productCategoriesTotalCount(parentId: String, withChild: Boolean, searchValue: String, status: String, meta: String): Int
  productCategoryDetail(_id: String): ProductCategory
  products(
    ${productsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [Product]
  productsTotalCount(${productsQueryParams}): Int
  productsGroupCounts(only: String, segment: String, segmentData: String): JSON
  productDetail(_id: String): Product
  productCountByTags: JSON
  productSimilarities(_id: String!, groupedSimilarity: String): ProductSimilarity

  productsCheckUsedPipeline(
    ${productsQueryParams},
    excludeStageIds: [String],
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [ProductsUsedPipeline]
  productsConfigs: [ProductsConfig]
`;

export const mutations = `
  productsAdd(${productParams}): Product
  productsEdit(_id: String!, ${productParams}): Product
  productsRemove(productIds: [String!]): String
  productsMerge(productIds: [String], productFields: JSON): Product
  productsDuplicate(_id: String!): Product
  productCategoriesAdd(${productCategoryParams}): ProductCategory
  productCategoriesEdit(_id: String!, ${productCategoryParams}): ProductCategory
  productCategoriesRemove(_id: String!): JSON
  productsConfigsUpdate(configsMap: JSON!): JSON
`;
