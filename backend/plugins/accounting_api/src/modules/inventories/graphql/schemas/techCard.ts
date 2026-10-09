export const types = `
  type TechCardItem {
    productId: String
    product: Product
    uom: String
    quantity: Float
    costRatio: Float
  }

  input TechCardItemInput {
    productId: String!
    uom: String
    quantity: Float!
    costRatio: Float
  }

  type TechCard {
    _id: String!
    code: String
    name: String
    description: String
    duration: Float
    durationType: String
    inputs: [TechCardItem]
    outputs: [TechCardItem]
    status: String
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
  }

  type TechCards {
    techCards: [TechCard],
    totalCount: Float,
  }
`;

export const queries = `
  techCards(
    searchValue: String,
    status: String,
    page: Int,
    perPage: Int,
    sortField: String,
    sortDirection: Int,
  ): TechCards
  techCardDetail(_id: String!): TechCard
`;

export const mutations = `
  techCardAdd(
    code: String,
    name: String!,
    description: String,
    duration: Float,
    durationType: String,
    inputs: [TechCardItemInput]!,
    outputs: [TechCardItemInput]!,
    status: String,
  ): TechCard
  techCardEdit(
    _id: String!,
    code: String,
    name: String!,
    description: String,
    duration: Float,
    durationType: String,
    inputs: [TechCardItemInput]!,
    outputs: [TechCardItemInput]!,
    status: String,
  ): TechCard
  techCardRemove(_id: String!): JSON
`;
