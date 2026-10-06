export const types = `
  type ProductCondition {
    _id: String!
    name: String!
  }

  type ProductConditionGroup {
    _id: String!
    name: String!
    description: String
    conditions: [ProductCondition]
    createdAt: Date
    updatedAt: Date
  }

  input ProductConditionInput {
    _id: String
    name: String!
  }
`;

export const queries = `
  productConditionGroups: [ProductConditionGroup]
`;

const mutationParams = `
  name: String!,
  description: String,
  conditions: [ProductConditionInput],
`;

export const mutations = `
  productConditionGroupsAdd(${mutationParams}): ProductConditionGroup
  productConditionGroupsEdit(_id: String!, ${mutationParams}): ProductConditionGroup
  productConditionGroupsRemove(_ids: [String!]!): JSON
  productCategorySetConditionGroup(categoryId: String!, conditionGroupId: String): Int
  productsSetConditionGroup(productIds: [String!]!, conditionGroupId: String): Int
`;
