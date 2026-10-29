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

  enum AuthLdapServerType {
    activeDirectory
    openLdap
  }

  type AuthLdapGroupMapping {
    groupDn: String!
    permissionGroupIds: [String!]!
  }

  type AuthLdapConfig {
    enabled: Boolean!
    serverType: AuthLdapServerType!
    url: String
    startTls: Boolean!
    bindDn: String
    hasBindPassword: Boolean!
    baseDn: String
    loginAttribute: String
    userFilter: String
    allowedGroupDns: [String!]!
    linkEmailDomains: [String!]!
    groupMappings: [AuthLdapGroupMapping!]!
    updatedAt: Date
  }

  type AuthLdapProfile {
    dn: String!
    username: String
    email: String
    firstName: String
    lastName: String
    groupDns: [String!]!
  }

  type AuthLdapTestResult {
    ok: Boolean!
    message: String!
    profile: AuthLdapProfile
  }

  input AuthLdapGroupMappingInput {
    groupDn: String!
    permissionGroupIds: [String!]!
  }

  input AuthLdapConfigInput {
    enabled: Boolean!
    serverType: AuthLdapServerType!
    url: String!
    startTls: Boolean!
    bindDn: String!
    bindPassword: String
    baseDn: String!
    loginAttribute: String!
    userFilter: String
    allowedGroupDns: [String!]!
    linkEmailDomains: [String!]!
    groupMappings: [AuthLdapGroupMappingInput!]!
  }
`;

export const queries = `
  currentUser: User
  oauthClientApps(searchValue: String, page: Int, perPage: Int): [OAuthClientApp]
  oauthClientAppsTotalCount(searchValue: String): Int
  oauthClientAppDetail(_id: String!): OAuthClientApp
  authLdapConfig: AuthLdapConfig
  authLdapLinkedUserIds: [String!]!
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
  authLdapConfigSave(input: AuthLdapConfigInput!): AuthLdapConfig
  authLdapTestConnection(input: AuthLdapConfigInput!, identifier: String): AuthLdapTestResult
  authLdapLinkUser(userId: String!, identifier: String!): Boolean
  authLdapUnlinkUser(userId: String!): Boolean

 `;
