export const queries = `
  mnConfigDetail(_id: String!): MNConfig
  mnConfig(code: String!, subId: String): MNConfig
  mnConfigs(code: String!): [MNConfig]
  mnConfigsCount(code: String!): Int
`;
export default queries;