export const types = `
  type TechCardCost {
    name: String!
    amount: Float!
    accountId: String!
  }

  input TechCardCostInput {
    name: String!
    amount: Float!
    accountId: String!
  }

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
    laborCosts: [TechCardCost!]!
    overheadCosts: [TechCardCost!]!
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

  type TechCardOutputRow {
    _id: String!
    techCard: TechCard!
    output: TechCardItem!
    outputIndex: Int!
  }

  type TechCardOutputs {
    rows: [TechCardOutputRow!]!
    totalCount: Int!
  }
`;

const techCardListParams = `
  searchValue: String,
  status: String,
  laborCostName: String,
  overheadCostName: String,
  hasLabor: Boolean,
  hasOverhead: Boolean,
  inputProductId: String,
  outputProductId: String,
  durationType: String,
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const queries = `
  techCards(${techCardListParams}): TechCards
  techCardOutputs(${techCardListParams} duplicatedOutput: Boolean): TechCardOutputs
  techCardDetail(_id: String!): TechCard
`;

export const mutations = `
  techCardAdd(
    code: String,
    name: String!,
    description: String,
    duration: Float,
    durationType: String,
    laborCosts: [TechCardCostInput!],
    overheadCosts: [TechCardCostInput!],
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
    laborCosts: [TechCardCostInput!],
    overheadCosts: [TechCardCostInput!],
    inputs: [TechCardItemInput]!,
    outputs: [TechCardItemInput]!,
    status: String,
  ): TechCard
  techCardRemove(_id: String!): JSON
`;
