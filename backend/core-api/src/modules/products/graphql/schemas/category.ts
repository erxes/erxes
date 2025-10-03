export const types = `
  type ProductCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
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
`;

const queryParams = `
  ids:[String],
  parentId: String,
  withChild: Boolean, 
  searchValue: String, 
  status: String, 
  meta: String, 
  brandIds: [String]
`;

export const queries = `
  productCategories(${queryParams}): [ProductCategory]
  productCategoriesTotalCount(${queryParams}): Int
  productCategoryDetail(_id: String): ProductCategory
`;

const mutationParams = `
  name: String!,
  code: String!,
  description: String,
  meta: String,
  parentId: String,
  scopeBrandIds: [String],
  attachment: AttachmentInput,
  status: String,
  maskType: String,
  mask: JSON,
  isSimilarity: Boolean,
  similarities: JSON
`;

export const mutations = `
  productCategoriesAdd(${mutationParams}): ProductCategory
  productCategoriesEdit(_id: String!, ${mutationParams}): ProductCategory
  productCategoriesRemove(_id: String!): JSON
`;
