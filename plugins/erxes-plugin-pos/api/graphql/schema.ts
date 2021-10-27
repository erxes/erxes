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
  waitingScreen: JSON
  kitchenScreen: JSON
  kioskMachine: JSON
  uiOptions: JSON
  formSectionTitle: String
  formIntegrationIds: [String]
  token: String
`;

export const types = `
  type Pos {
    _id: String
    createdAt: Date
    integrationId: String
    userId: String 
    integration: Integration
    user: User
    ${posCommonFields}
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
  posList(page: Int,
    perPage: Int,
    brandId: String,
    tag: String,
    status: String,
    sortField: String
    sortDirection: Int): [Pos]
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
