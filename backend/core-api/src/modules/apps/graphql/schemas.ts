export const types = `
  type App {
    _id: String
    name: String
    token: String
    status: String
    lastUsedAt: Date
    createdAt: Date
  }
`;

export const mutations = `
  appsAdd(name: String!): App
  appsEdit(_id: String!, name: String): App
  appsRevoke(_id: String!): App
  appsRemove(_id: String!): JSON
`;

export const queries = `
  apps(searchValue: String, page: Int, perPage: Int): [App]
  appsTotalCount(searchValue: String): Int
  appDetail(_id: String): App
`;
