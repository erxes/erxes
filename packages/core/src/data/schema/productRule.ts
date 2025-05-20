const productRuleDefs = `
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

export const types = `
  type ProductRule {
    _id: String!,
    ${productRuleDefs}

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

export const mutations = `
  productRulesAdd(${productRuleDefs}): ProductRule
  productRulesEdit(_id: String!, ${productRuleDefs}): ProductRule
  productRulesRemove(_id: String!): JSON
`;
