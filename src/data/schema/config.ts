export const types = `
  type Config {
    _id: String!
    code: String!
    value: JSON
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
  configs: [Config]
  configsVersions: ProjectInfos
  configsGetEnv: ENV
  configsConstants: JSON
`;

export const mutations = `
  configsUpdate(configsMap: JSON!): JSON
`;
