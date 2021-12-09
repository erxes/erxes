export const types = `
  type LoyaltyConfig {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  loyaltyConfigs: [LoyaltyConfig]
`;

export const mutations = `
  loyaltyConfigsUpdate(configsMap: JSON!): JSON
`;