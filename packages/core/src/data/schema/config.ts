export const types = `

  type Config {
    _id: String!
    code: String!
    value: JSON
  }

  type ENV {
    USE_BRAND_RESTRICTIONS: String
  }
`;

export const queries = `
  search(value: String!): [JSON]
  configs: [Config]
  configsGetVersion(releaseNotes: Boolean): JSON
  configsGetEnv: ENV
  configsConstants: JSON
  configsCheckActivateInstallation(hostname: String!): JSON
  configsCheckPremiumService(type: String!): Boolean
  configsGetEmailTemplate(name: String): String
  enabledServices: JSON
`;

export const mutations = `
  configsUpdate(configsMap: JSON!): JSON
  configsActivateInstallation(token: String!, hostname: String!): JSON
  configsManagePluginInstall(type: String!, name: String!): JSON
`;
