import {
  types as PricingPlanTypes,
  queries as PricingPlanQueries,
  mutations as PricingPlanMutations,
} from './pricingPlan';

export const types = `
  type Pricing {
    _id: String
    name: String
    description: String
  }

  ${PricingPlanTypes()}
`;

export const queries = `
  getPricing(_id: String!): Pricing
  getPricings: [Pricing]

  ${PricingPlanQueries}
`;

export const mutations = `
  createPricing(name: String!): Pricing
  updatePricing(_id: String!, name: String!): Pricing
  removePricing(_id: String!): Pricing

  ${PricingPlanMutations}
`;
