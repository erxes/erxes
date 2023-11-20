export const types = `
  type Config {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  syncmanyerkhetConfigs: [Config]
  syncmanyerkhetConfigsGetValue(code:String!):JSON
`;

export const mutations = `
  syncmanyerkhetConfigsUpdate(configsMap: JSON!): JSON
`;
