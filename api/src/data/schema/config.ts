export const types = `
  type Config {
    _id: String!
    code: String!
    value: JSON
  }

  type GeneralInfo {
    packageVersion: String
  }

  type OSInfo {
    type: String
    platform: String
    arch: String
    release: String
    uptime: Int
    loadavg: [Float]
    totalmem: Float
    freemem: Float
    cpuCount: Int
  }

  type ProcessInfo {
    nodeVersion: String
    pid: String
    uptime: String
  }

  type MongoInfo {
    version: String
    storageEngine: String
  }

  type Statistic {
    packageVersion: String
    os: OSInfo
    process: ProcessInfo
    mongo: MongoInfo
  }

  type ProjectStatistics {
    erxesApi: Statistic
    erxesIntegration: Statistic
    erxes: GeneralInfo
  }

  type ENV {
    USE_BRAND_RESTRICTIONS: String
  }
`;

export const queries = `
  configs: [Config]
  configsStatus: ProjectStatistics
  configsGetEnv: ENV
  configsConstants: JSON
  configsCheckActivateInstallation(hostname: String!): JSON
`;

export const mutations = `
  configsUpdate(configsMap: JSON!): JSON
  configsActivateInstallation(token: String!, hostname: String!): JSON
`;
