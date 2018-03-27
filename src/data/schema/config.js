export const types = `
  type Config {
    _id: String!
    code: String!
    value: [String]!
  }
`;

export const queries = `
  configsDetail(code: String!): Config
`;

export const mutations = `
  configsInsert(code: String!, value: [String]!): Config
`;
