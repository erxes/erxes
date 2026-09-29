import { gql } from '@apollo/client';

const MARKETPLACE_PLUGIN_INSTALL = gql`
  mutation MarketplacePluginInstall($name: String, $repoUrl: String) {
    marketplacePluginInstall(name: $name, repoUrl: $repoUrl) {
      _id
      name
      version
      enabled
    }
  }
`;

const MARKETPLACE_PLUGIN_SET_ENABLED = gql`
  mutation MarketplacePluginSetEnabled($_id: String!, $enabled: Boolean!) {
    marketplacePluginSetEnabled(_id: $_id, enabled: $enabled) {
      _id
      name
      enabled
    }
  }
`;

const MARKETPLACE_PLUGIN_UNINSTALL = gql`
  mutation MarketplacePluginUninstall($_id: String!) {
    marketplacePluginUninstall(_id: $_id)
  }
`;

export {
  MARKETPLACE_PLUGIN_INSTALL,
  MARKETPLACE_PLUGIN_SET_ENABLED,
  MARKETPLACE_PLUGIN_UNINSTALL,
};
