export const types = `
  type Pricing {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getPricing(_id: String!): Pricing
  getPricings: [Pricing]
`;

export const mutations = `
  createPricing(name: String!): Pricing
  updatePricing(_id: String!, name: String!): Pricing
  removePricing(_id: String!): Pricing
`;
