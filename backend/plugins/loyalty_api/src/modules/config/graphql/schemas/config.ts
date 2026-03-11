export const types = `
  type LoyaltyConfig @key(fields: "_id") {
    _id: String
    code: String
    value: JSON
  }
`;

export const queries = `
  loyaltyConfigs: [LoyaltyConfig]
`;

export const mutations = `
  loyaltyConfigsUpdate(configsMap: JSON!): JSON
`;
