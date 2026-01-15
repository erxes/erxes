export const types = `
  type MNConfig {
    _id: String!
    code: String!
    subId: String
    value: JSON
  }
`;

export const queries = `
  mnConfigDetail(_id: String!): MNConfig
  mnConfig(code: String!, subId: String): MNConfig
  mnConfigs(code: String!): [MNConfig]
  mnConfigsCount(code: String!): Int
`;

export const mutations = `
  mnConfigsCreate(code: String!, subId: String, value: JSON): MNConfig
  mnConfigsUpdate(_id: String!, subId: String, value: JSON): MNConfig
`;
