export const types = `
  type Account {
    kind: String
    name: String
    id: String
  }
`;

export const queries = `
  accounts: [Account]
`;

export const mutations = `
  accountsRemove(_id: String!): JSON
`;
