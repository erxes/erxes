export const types = `
  type LoyaltyConfig @key(fields: "_id") @cacheControl(maxAge: 3) {
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
