export const types = `
  type Config {
    _id: String!
    code: String!
    value: [String]!
  }

  type GitInfos {
    packageVersion: String
    branch: String
    sha: String
    abbreviatedSha: String
  }

  type ProjectInfos {
    erxesVersion: GitInfos
    apiVersion: GitInfos
    widgetVersion: GitInfos
  }

  type ENV {
    USE_BRAND_RESTRICTIONS: String
  }
`;

export const queries = `
  configsDetail(code: String!): Config
  configsVersions: ProjectInfos
  configsGetEnv: ENV
`;

export const mutations = `
  configsInsert(code: String!, value: [String]!): Config
`;
