const commonFields = `
  name: String
  userGroupId: String
  expireDate: Date    
  allowAllPermission: Boolean
  noExpire: Boolean
`;

export const types = `
  type App {
    _id: String
    isEnabled: Boolean
    createdAt: Date
    ${commonFields}
    accessToken: String
    refreshToken: String

    userGroupName: String
  }

  type Client {
    _id: String
    name: String
    appId: String
    appSecret: String
    refreshToken: String
    whiteListedIps: [String]
    permissions: [Permission]
    createdAt: Date
  }

  type AuthCredentials {
    clientId: String
    clientSecret: String
  }

  type ClientList {
    list: [Client]
    totalCount: Int
  }
`;

export const mutations = `
  appsAdd(${commonFields}): App
  appsEdit(_id: String!, ${commonFields}): App
  appsRemove(_id: String!): JSON

  clientsAdd(name: String!, whiteListedIps: [String], permissions: [String]): AuthCredentials
  clientsEdit(_id: String!, name: String, whiteListedIps: [String], permissions: [String]): Client
  clientsRemove(_id: String!): JSON
`;

export const queries = `
  apps: [App]
  appsTotalCount: Int
  appDetail(_id: String): App

  clients(searchValue: String): [Client]
  clientList(page: Int, perPage: Int, searchValue: String): ClientList
  clientDetail(_id: String): Client
  clientsTotalCount(searchValue: String): Int
`;
