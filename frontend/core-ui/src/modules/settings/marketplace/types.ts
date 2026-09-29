export interface IMarketplacePluginApi {
  image?: string;
  address?: string;
  port?: number;
  health?: string;
  env?: string[];
  hasSubscriptions?: boolean;
}

export interface IMarketplacePluginUi {
  remote?: string;
  entry?: string;
  exposes?: string[];
}

export interface IMarketplacePlugin {
  name: string;
  version?: string;
  description?: string;
  icon?: string;
  api?: IMarketplacePluginApi;
  ui?: IMarketplacePluginUi;
  installed: boolean;
  enabled: boolean;
}

export interface IInstalledPlugin {
  _id: string;
  name: string;
  version?: string;
  description?: string;
  icon?: string;
  source?: string;
  repoUrl?: string;
  ui?: IMarketplacePluginUi;
  enabled: boolean;
  createdAt?: string;
}

export interface IMarketplacePluginsData {
  marketplacePlugins: IMarketplacePlugin[];
}

export interface IInstalledPluginsData {
  installedPlugins: IInstalledPlugin[];
}
