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

export const queries = `
  getGithubConnection: GithubConnection
  getGithubConnections: [GithubConnection!]!
  getGithubRepositories(installationId: Int!): [GithubRepository]
`;

export const mutations = `
    disconnectGithubConnection(installationId: Int!): DisconnectResponse
`;
