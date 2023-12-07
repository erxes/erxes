export const types = `
  type Config {
    _id: String!
    code: String!
    value: JSON
  }

  type AmountByBrand {
    _id: String
    name: String
    amount: Float
  }
`;

export const queries = `
  multierkhetConfigs: [Config]
  multierkhetConfigsGetValue(code:String!):JSON
  dealPayAmountByBrand(_id: String!): [AmountByBrand]
`;

export const mutations = `
  multierkhetConfigsUpdate(configsMap: JSON!): JSON
`;
