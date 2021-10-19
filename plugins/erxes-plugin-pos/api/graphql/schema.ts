const groupCommonFields = `
  posId: String
  description: String
  name: String
`;

const posCommonFields = `
  name: String
  description: String
  brandId: String
  tagIds: [String]
  productDetails: [String]
  productGroupIds: [String]
`

export const types = `
  type Pos {
    _id: String
    name: String
    description: String
    createdAt: Date
    integrationId: String 
    productDetails: [String] 
    productGroupIds: [String] 
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
  posDetail(integrationId: String!): Pos
  posConfig(integrationId: String!): PosConfig
  productGroups(posId: String!): [ProductGroups]
`;

export const mutations = `
  posAdd(${posCommonFields}): Pos
  posEdit(_id: String ${posCommonFields}): Pos
  posRemove(_id: String!): JSON
`;

// posConfigsUpdate(posId: String!, configsMap: JSON!): JSON
// productGroupsAdd(${groupCommonFields}): ProductGroups
// productGroupsEdit(_id: String! ${groupCommonFields}): ProductGroups