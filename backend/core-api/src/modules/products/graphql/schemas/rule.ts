export const types = `
  type ProductRule {
    _id: String!,
    categoryIds: [String],
    excludeCategoryIds: [String],
    productIds: [String],
    excludeProductIds: [String],
    tagIds: [String],
    excludeTagIds: [String],
    unitPrice: Float!,
    bundleId: String,
    name: String!

    categories: [ProductCategory],
    excludeCategories: [ProductCategory],
    products: [Product],
    excludeProducts: [Product],
    tags: [Tag],
    excludeTags: [Tag]
  }

  type ProductRulesCount {
    list: [ProductRule]
    totalCount: Int
  }
`;

export const queries = `
  productRules: [ProductRule]
  productRulesWithCount: ProductRulesCount
`;

const mutationParams = `
  categoryIds: [String],
  excludeCategoryIds: [String],
  productIds: [String],
  excludeProductIds: [String],
  tagIds: [String],
  excludeTagIds: [String],
  unitPrice: Float!,
  bundleId: String,
  name: String!
`;

export const mutations = `
  productRulesAdd(${mutationParams}): ProductRule
  productRulesEdit(_id: String!, ${mutationParams}): ProductRule
  productRulesRemove(_ids: [String]): JSON
`;
