const groupCommonFields = `
  posId: String
  description: String
  name: String
`;

export const types = `
  type Pos {
    _id: String
    name: String
    description: String
    createdAt: Date
  }



  type ProductGroups {
    _id: String
    name: String
    description: String
    categoryIds: [String]
    excludedCategoryIds: [String]
    excludedProductIds: [String]
  }

  type PosConfig {
    _id: String
    integrationId: String
    productDetails: [String]
    productGroupIds: [String]
    productGroups: [ProductGroups]
  }
`;

export const queries = `
  allPos: [Pos]
  posConfig(integrationId: String!): PosConfig
  productGroups(posId: String!): [ProductGroups]
`;

export const mutations = `
  posAdd(
    name: String description: String
  ): Pos

  posEdit(
    _id: String name: String description: String
  ): Pos

  posRemove(_id: String!): JSON

  posConfigsUpdate(posId: String!, configsMap: JSON!): JSON

  productGroupsAdd(${groupCommonFields}): ProductGroups
  productGroupsEdit(_id: String! ${groupCommonFields}): ProductGroups
`;