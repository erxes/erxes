export const types = `

  type AccountingsConfig {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  accountingsConfigs: [AccountingsConfig]
  accountingsConfigsByCode(codes: [String]): JSON
`;

export const mutations = `
  accountingsConfigsUpdate(configsMap: JSON!): JSON
`;
