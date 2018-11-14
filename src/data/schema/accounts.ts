export const types = `
  type Account {
    _id: String
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
