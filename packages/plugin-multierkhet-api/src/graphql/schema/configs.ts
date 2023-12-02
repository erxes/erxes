export const types = `
  type Config {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  multierkhetConfigs: [Config]
  multierkhetConfigsGetValue(code:String!):JSON
`;

export const mutations = `
  multierkhetConfigsUpdate(configsMap: JSON!): JSON
`;
