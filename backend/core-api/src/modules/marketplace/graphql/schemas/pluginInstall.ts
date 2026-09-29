export const types = `
  type PluginInstallApi {
    image: String
    address: String
    port: Int
    health: String
    env: [String]
    hasSubscriptions: Boolean
  }

  type PluginInstallUi {
    remote: String
    entry: String
    exposes: [String]
  }

  type PluginInstall {
    _id: String
    name: String
    version: String
    description: String
    icon: String
    source: String
    repoUrl: String
    api: PluginInstallApi
    ui: PluginInstallUi
    enabled: Boolean
    createdAt: Date
    updatedAt: Date
  }

  type MarketplacePlugin {
    name: String
    version: String
    description: String
    icon: String
    api: PluginInstallApi
    ui: PluginInstallUi
    installed: Boolean
    enabled: Boolean
  }
`;

export const queries = `
  marketplacePlugins: [MarketplacePlugin]
  installedPlugins: [PluginInstall]
  installedPlugin(_id: String): PluginInstall
`;

export const mutations = `
  marketplacePluginInstall(name: String, repoUrl: String): PluginInstall
  marketplacePluginSetEnabled(_id: String!, enabled: Boolean!): PluginInstall
  marketplacePluginUninstall(_id: String!): JSON
`;
