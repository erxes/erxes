export const types = `
  type AccountingsConfig {
    _id: String!
    code: String!
    subId: String
    value: JSON
  }
`;

export const queries = `
  accountingsConfigDetail(_id: String!): AccountingsConfig
  accountingsConfig(code: String!, subId: String): AccountingsConfig
  accountingsConfigs(code: String!): [AccountingsConfig]
  accountingsConfigsCount(code: String!): Int
  accountingsConfigsByCode(codes: [String]): JSON
`;

export const mutations = `
  accountingsConfigsCreate(code: String!, subId: String, value: JSON): AccountingsConfig
  accountingsConfigsUpdate(_id: String!, subId: String, value: JSON): AccountingsConfig
  accountingsConfigsRemove(_id: String!): String
  accountingsConfigsUpdateByCode(configsMap: JSON!): JSON
`;
