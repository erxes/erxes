const commonFields = `
  name: String
  userGroupId: String
  expireDate: Date
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
`;

export const mutations = `
  appsAdd(${commonFields}): App
  appsEdit(_id: String!, ${commonFields}): App
  appsRemove(_id: String!): JSON
`;

export const queries = `
  apps: [App]
  appsTotalCount: Int
  appDetail(_id: String): App
`;
