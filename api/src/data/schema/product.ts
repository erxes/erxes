export const types = `
  type ProductCategory {
    _id: String!
    name: String
    description: String
    parentId: String
    code: String!
    order: String!
    attachment: Attachment
    status: String

    isRoot: Boolean
    productCount: Int
  }

  type Product {
    _id: String!
    name: String
    code: String
    type: String
    description: String
    sku: String
    unitPrice: Float
    categoryId: String
    customFieldsData: JSON
    createdAt: Date
    getTags: [Tag]
    tagIds: [String]
    attachment: Attachment
    attachmentMore: [Attachment]
    vendorId: String
    supply: String
    productCount: Int
    minimiumCount: Int

    category: ProductCategory
    vendor: Company
    
    customFieldsDataWithText: JSON
  }
`;

const productParams = `
  name: String,
  categoryId: String,
  type: String,
  description: String,
  sku: String,
  unitPrice: Float,
  code: String,
  customFieldsData: JSON,
  attachment: AttachmentInput,
  attachmentMore: [AttachmentInput],
  supply: String,
  productCount: Int,
  minimiumCount: Int
  vendorId: String,
`;

const productCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  attachment: AttachmentInput,
  status: String
`;

export const queries = `
  productCategories(parentId: String, searchValue: String, status: String): [ProductCategory]
  productCategoriesTotalCount: Int
  productCategoryDetail(_id: String): ProductCategory

  products(
    type: String,
    categoryId: String,
    searchValue: String,
    tag: String,
    page: Int,
    perPage: Int ids: [String],
    excludeIds: Boolean,
    pipelineId: String,
    boardId: String
  ): [Product]
  productsTotalCount(type: String): Int
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
  productSelectFeature(_id: String, counter: String): Product
`;
