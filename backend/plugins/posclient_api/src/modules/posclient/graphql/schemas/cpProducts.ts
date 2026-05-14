const commonFieldDefs = `
  _id: String!
  name: String
  description: String
  attachment: Attachment
  code: String
`;

export const types = `
  type cpPosProductCategory {
    ${commonFieldDefs}
    parentId: String
    meta: String
    order: String!
    isRoot: Boolean
    productCount: Int
    maskType: String
    mask: JSON
    isSimilarity: Boolean
    similarities: JSON
  }

  type cpPoscProduct {
    ${commonFieldDefs}
    shortName: String
    type: String
    barcodes: [String]
    barcodeDescription: String
    unitPrice: Float
    savedRemainder: Float
    categoryId: String
    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    createdAt: Date
    tagIds: [String]
    vendorId: String
    attachmentMore: [Attachment]
    uom: String
    subUoms: JSON
    category: cpPosProductCategory
    remainder: Float
    soonIn: Float
    soonOut: Float
    remainders: [JSON]
    isCheckRem: Boolean
    hasSimilarity: Boolean
    pdfAttachment: PdfAttachment
  }

  type cpPoscProductSimilarityGroup {
    title: String
    fieldId: String
  }
  type cpPoscProductSimilarity {
    products: [cpPoscProduct],
    groups: [cpPoscProductSimilarityGroup],
  }
`;

const productsQueryParams = `
  type: String,
  categoryId: String,
  searchValue: String,
  branchId: String,
  vendorId: String,
  tag: String,
  tags: [String]
  excludeTags: [String]
  tagWithRelated: Boolean
  ids: [String],
  excludeIds: Boolean,
  segment: String,
  segmentData: String,
  isKiosk: Boolean,
  groupedSimilarity: String,
  categoryMeta: String,
  image: String,
  minRemainder: Float
  maxRemainder: Float
  minPrice: Float
  maxPrice: Float
`;

const productCategoriesParams = `
  parentId: String,
  withChild: Boolean,
  searchValue: String,
  status: String,
  excludeEmpty: Boolean,
  meta: String,
  isKiosk: Boolean,
  ids: [String],
  excludeIds: Boolean,
`;
const commonParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const queries = `
  cpPoscProductCategories(
    ${productCategoriesParams}
    ${commonParams}
  ): [cpPosProductCategory]
  cpPoscProductCategoriesTotalCount(${productCategoriesParams}): Int
  cpPoscProductCategoryDetail(_id: String): cpPosProductCategory

  cpPoscProducts(
    ${productsQueryParams}
    ${commonParams}
  ): [cpPoscProduct]
  cpPoscProductsTotalCount(
    ${productsQueryParams}
  ): Int
  cpPoscProductDetail(_id: String, branchId: String): cpPoscProduct
  cpGetPriceInfo(productId: String!): String
  cpPoscProductSimilarities(_id: String!, groupedSimilarity: String, branchId: String): cpPoscProductSimilarity
`;
