export const type = `
  type GithubConfig {
    _id: String
    teamId: String
    repoName: String
    installationId: Int
    syncMode: String
    createdAt: Date
    updatedAt: Date
  }
`;

const upsertGithubConfigParams = `
  teamId: String!
  repoName: String!
  installationId: Int!
  syncMode: String!
`;

export const queries = `
  getGithubConfigByTeam(teamId: String!): GithubConfig
  getAllGithubConfigs(installationId: Int!): [GithubConfig]
`;

export const mutations = `
upsertGithubConfig(${upsertGithubConfigParams}): GithubConfig
`;