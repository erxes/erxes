const groupCommonFields = `
  posId: String
  description: String
  name: String
  categoryIds: [String]
  excludedCategoryIds: [String]
  excludedProductIds: [String]
`;

const posCommonFields = `
  name: String
  description: String
  brandId: String
  tagIds: [String]
  productDetails: [String]
  adminIds: [String]
  cashierIds: [String]
`

export const types = `
  type Pos {
    _id: String
    name: String
    description: String
    createdAt: Date
    integrationId: String
    userId: String 
    productDetails: [String] 
    adminIds: [String] 
    cashierIds: [String] 
    integration: Integration
    user: User
  }

  type ProductGroups {
    _id: String
    name: String
    description: String
    posId: String
    categoryIds: [String]
    excludedCategoryIds: [String]
    excludedProductIds: [String]
  }

  input GroupInput {
    _id: String
    description: String
    name: String
    categoryIds: [String]
    excludedCategoryIds: [String]
    excludedProductIds: [String]
  }
`;

export const queries = `
  posList: [Pos]
  posDetail(_id: String!): Pos
  productGroups(posId: String!): [ProductGroups]
`;

export const mutations = `
  posAdd(${posCommonFields}): Pos
  posEdit(_id: String ${posCommonFields}): Pos
  posRemove(_id: String!): JSON
  productGroupsAdd(${groupCommonFields}): ProductGroups
  productGroupsBulkInsert(posId: String, groups:[GroupInput]): [ProductGroups]
`;



