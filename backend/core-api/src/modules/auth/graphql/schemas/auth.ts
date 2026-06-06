export const types = `
  type AuthTokenResponse {
    tokenType: String!
    accessToken: String!
    refreshToken: String!
    expiresIn: Int!
    user: User
  }

  enum OAuthClientAppType {
    public
    confidential
  }

  enum OAuthClientAppStatus {
    active
    revoked
  }

  enum OAuthClientAccessTokenLifetime {
    year
    half
    trio
  }

  type OAuthClientApp {
    _id: String
    name: String
    logo: String
    description: String
    clientId: String
    type: OAuthClientAppType
    accessTokenLifetime: OAuthClientAccessTokenLifetime
    redirectUrls: [String]
    status: OAuthClientAppStatus
    lastUsedAt: Date
    createdAt: Date
    updatedAt: Date
    generatedSecret: String
  }
`;

export const queries = `
  currentUser: User
  oauthClientApps(searchValue: String, page: Int, perPage: Int): [OAuthClientApp]
  oauthClientAppsTotalCount(searchValue: String): Int
  oauthClientAppDetail(_id: String!): OAuthClientApp
`;

export const mutations = `
  login(email: String!, password: String! deviceToken: String): String
  logout: String
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): JSON
  loginWithGoogle: String
  loginWithMagicLink(email: String!): String
  oauthClientAppsAdd(
    name: String!
    logo: String
    description: String
    type: OAuthClientAppType!
    accessTokenLifetime: OAuthClientAccessTokenLifetime
    redirectUrls: [String!]
  ): OAuthClientApp
  oauthClientAppsEdit(
    _id: String!
    name: String!
    logo: String
    description: String
    type: OAuthClientAppType!
    accessTokenLifetime: OAuthClientAccessTokenLifetime
    redirectUrls: [String!]
  ): OAuthClientApp
  oauthClientAppsRevoke(_id: String!): OAuthClientApp
  oauthClientAppsRemove(_id: String!): JSON

 `;
