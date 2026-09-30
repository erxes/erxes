import { gql } from '@apollo/client';

const MARKETPLACE_PLUGINS = gql`
  query MarketplacePlugins {
    marketplacePlugins {
      name
      version
      description
      icon
      ui {
        remote
        entry
        exposes
      }
      installed
      enabled
    }
  }
`;

const MARKETPLACE_CATALOG_ERROR = gql`
  query MarketplaceCatalogError {
    marketplaceCatalogError
  }
`;

const MARKETPLACE_INSTALLED_PLUGINS = gql`
  query MarketplaceInstalledPlugins {
    marketplaceInstalledPlugins {
      _id
      name
      version
      description
      icon
      source
      repoUrl
      ui {
        remote
        entry
        exposes
      }
      enabled
      createdAt
    }
  }
`;

const MARKETPLACE_GITHUB_INSTALL_ENABLED = gql`
  query MarketplaceGithubInstallEnabled {
    marketplaceGithubInstallEnabled
  }
`;

export {
  MARKETPLACE_PLUGINS,
  MARKETPLACE_CATALOG_ERROR,
  MARKETPLACE_INSTALLED_PLUGINS,
  MARKETPLACE_GITHUB_INSTALL_ENABLED,
};
