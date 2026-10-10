export const types = `
  type ProductCondition {
    _id: String!
    code: String!
    name: String!
    description: String
    productCount: Int
    createdAt: Date
    updatedAt: Date
  }

  enum ProductConditionCodesMode {
    add
    remove
  }
`;

export const queries = `
  productConditions: [ProductCondition]
`;

const mutationParams = `
  code: String!,
  name: String!,
  description: String,
`;

export const mutations = `
  productConditionsAdd(${mutationParams}): ProductCondition
  productConditionsEdit(_id: String!, ${mutationParams}): ProductCondition
  productConditionsRemove(_ids: [String!]!): JSON
  productCategorySetConditionCodes(categoryId: String!, codes: [String!]!, mode: ProductConditionCodesMode!): Int
  productsSetConditionCodes(productIds: [String!]!, codes: [String!]!, mode: ProductConditionCodesMode!): Int
`;
