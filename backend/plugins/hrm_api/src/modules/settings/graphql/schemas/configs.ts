export const types = `
  type HrmConfig {
    _id: String!
    code: String!
    subId: String
    value: JSON
  }
`;

export const queries = `
  hrmConfigDetail(_id: String!): HrmConfig
  hrmConfig(code: String!, subId: String): HrmConfig
  hrmConfigs(code: String!): [HrmConfig]
  hrmConfigsCount(code: String!): Int
  hrmConfigsByCode(codes: [String!]!): JSON
`;

export const mutations = `
  hrmConfigsCreate(code: String!, subId: String, value: JSON): HrmConfig
  hrmConfigsUpdate(_id: String!, subId: String, value: JSON): HrmConfig
  hrmConfigsRemove(_id: String!): String
  hrmConfigsUpdateByCode(configsMap: JSON!): JSON
`;
