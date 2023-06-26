export const types = `
  type TumentechDeal @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    dealId: String
    startPlaceId: String
    endPlaceId: String
    driverIds: [String]
    requiredCarCategoryIds: [String]
    productCategoryId: String
    productSubCategoryId: string
    createdAt: Date
  }
`;

export const queries = `
    tumentechDealDetail(_id: String!): TumentechDeal
`;

const params = `
    dealId: String,
    startPlaceId: String,
    endPlaceId: String,
    driverIds: [String],
    requiredCarCategoryIds: [String],
    productCategoryId: String,
    productSubCategoryId: String,
`;

export const mutations = `
    tumentechDealAdd(${params}): TumentechDeal
    tumentechDealEdit(_id: String!, ${params}): TumentechDeal
    tumentechDealRemove(_id: String!): JSON
`;
