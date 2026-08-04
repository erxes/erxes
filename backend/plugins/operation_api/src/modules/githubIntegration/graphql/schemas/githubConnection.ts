export const type = `
  type GithubConnection {
    _id: String
    installationId: Int
    orgName: String
    orgAvatarUrl: String
    orgType: String
    initiatedUserId: String
    createdAt: Date
    updatedAt: Date
    subdomain: String
    isActive: Boolean
  }

  type GithubRepository {
    fullName: String
    name: String
    isPrivate: Boolean
  }

  type DisconnectResponse {
    success: Boolean
  }
`;

const upsertGithubConnectionParams = `
  installationId: Int!
  orgName: String!
  orgAvatarUrl: String
  orgType: String!
  initiatedUserId: String
  subdomain: String!
  isActive: Boolean!
`;

export const queries = `
  getGithubConnection: GithubConnection
  getGithubRepositories(installationId: Int!): [GithubRepository]
`;

export const mutations = `
    upsertGithubConnection(${upsertGithubConnectionParams}): GithubConnection
    disconnectGithubConnection(installationId: Int!): DisconnectResponse
`;
