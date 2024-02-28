export const types = `

  type AccountingsCongig {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  accountingsConfigs: [AccountingsCongig]
`;

export const mutations = `
  accountingsConfigsUpdate(configsMap: JSON!): JSON
`;
