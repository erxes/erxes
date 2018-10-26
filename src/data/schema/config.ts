export const types = `
  type Config {
    _id: String!
    code: String!
    value: [String]!
  }

  type GitInfos {
    packageVersion: String
    lastCommittedUser: String
    lastCommittedDate: String
    lastCommitMessage: String
    branch: String
    sha: String
    abbreviatedSha: String
  }

  type ProjectInfos {
    erxesVersion: GitInfos
    apiVersion: GitInfos
    widgetVersion: GitInfos
    widgetApiVersion: GitInfos
  }
`;

export const queries = `
  configsDetail(code: String!): Config
  configsVersions: ProjectInfos
`;

export const mutations = `
  configsInsert(code: String!, value: [String]!): Config
`;
