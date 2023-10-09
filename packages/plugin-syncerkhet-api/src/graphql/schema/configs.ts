export const types = `
  type Config {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  syncerkhetConfigs: [Config]
  syncerkhetConfigsGetValue(code:String!):JSON
`;

export const mutations = `
  syncerkhetConfigsUpdate(configsMap: JSON!): JSON
`;
