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

  type ClientPermission {
    module: String
    actions: [String]
  }

  type Client @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    name: String
    clientId: String
    clientSecret: String
    refreshToken: String
    whiteListedIps: [String]
    permissions: [ClientPermission]
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

  input ClientPermissionInput {
    module: String!
    actions: [String] 
  }
`;

export const mutations = `
  appsAdd(${commonFields}): App
  appsEdit(_id: String!, ${commonFields}): App
  appsRemove(_id: String!): JSON

  clientsAdd(name: String!, whiteListedIps: [String], permissions: [ClientPermissionInput]!): AuthCredentials
  clientsEdit(_id: String!, name: String, whiteListedIps: [String], permissions: [ClientPermissionInput]): Client
  clientsRemove(_id: String!): JSON
  clientsResetSecret(_id: String!): AuthCredentials
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
