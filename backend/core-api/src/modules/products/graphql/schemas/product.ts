import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Product @key(fields: "_id") @cacheControl(maxAge: 3) {
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
    propertiesData: JSON
    createdAt: Date
    tagIds: [String]
    attachment: Attachment
    attachmentMore: [Attachment]
    vendorId: String
    scopeBrandIds: [String]
    uom: String
    subUoms: JSON
    currency: String

    category: ProductCategory
    vendor: Company
    hasSimilarity: Boolean

    pdfAttachment: PdfAttachment

    cursor: String
    remainders: JSON
    discounts: JSON

    remainder: JSON
    discount: JSON
  }

  type ProductSimilarityGroup {
    title: String
    fieldId: String
  }

  type ProductSimilarity {
    products: [Product],
    groups: [ProductSimilarityGroup],
  }

  type ProductsListResponse {
    list: [Product],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

const queryParams = `
  type: String,
  status: String,
  categoryId: String,
  categoryIds: [String],
  searchValue: String,
  vendorId: String,
  brandIds: [String],
  tag: String,
  tagIds: [String],
  ids: [String],
  excludeIds: Boolean,
  excludeTagIds: [String]
  tagWithRelated: Boolean
  pipelineId: String,
  boardId: String,
  segment: String,
  segmentData: String,
  groupedSimilarity: String,
  image: String,
  brand: String,

  branchId: String,
  departmentId: String,
  minRemainder: Float,
  maxRemainder: Float,
  minPrice: Float,
  maxPrice: Float,
  minDiscountValue: Float,
  maxDiscountValue: Float,
  minDiscountPercent: Float,
  maxDiscountPercent: Float,
`;

export const queries = `
  productsMain(
    ${queryParams}
    ${GQL_CURSOR_PARAM_DEFS}
    sortField: String,
    sortDirection: Int,
  ): ProductsListResponse
  products(
    ${queryParams}
    page: Int,
    perPage: Int,
    sortField: String,
    sortDirection: Int,
  ): [Product]
  productsTotalCount(${queryParams}): Int
  productDetail(_id: String): Product
  productSimilarities(_id: String!, groupedSimilarity: String): ProductSimilarity
  productCountByTags: JSON
`;

export const mutationParams = `
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
  propertiesData: JSON
  attachment: AttachmentInput,
  attachmentMore: [AttachmentInput],
  vendorId: String,
  scopeBrandIds: [String],
  uom: String,
  subUoms: JSON,
  currency: String
  pdfAttachment: PdfAttachmentInput
`;

export const mutations = `
  productsAdd(${mutationParams}): Product
  productsEdit(_id: String!, ${mutationParams}): Product
  productsRemove(productIds: [String!]): String
  productsMerge(productIds: [String], productFields: JSON): Product
  productsDuplicate(_id: String!): Product
`;
