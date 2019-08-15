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
    widgetApiVersion: GitInfos
  }

  type EngagesConfig {
    accessKeyId: String
    secretAccessKey: String
    region: String
  }

  type ENV {
    USE_BRAND_RESTRICTIONS: String
  }
`;

export const queries = `
  configsDetail(code: String!): Config
  configsVersions: ProjectInfos
  engagesConfigDetail: EngagesConfig
  configsGetEnv: ENV
`;

export const mutations = `
  configsInsert(code: String!, value: [String]!): Config
  engagesConfigSave(accessKeyId: String, secretAccessKey: String, region: String): EngagesConfig
`;
