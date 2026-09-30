import { gql } from '@apollo/client';

const MARKETPLACE_PLUGINS = gql`
  query MarketplacePlugins {
    marketplacePlugins {
      name
      version
      description
      icon
      api {
        image
        address
        port
        health
        env
        hasSubscriptions
      }
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

const INSTALLED_PLUGINS = gql`
  query InstalledPlugins {
    installedPlugins {
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

export { MARKETPLACE_PLUGINS, MARKETPLACE_CATALOG_ERROR, INSTALLED_PLUGINS };
