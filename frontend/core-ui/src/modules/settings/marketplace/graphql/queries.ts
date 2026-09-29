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

export { MARKETPLACE_PLUGINS, INSTALLED_PLUGINS };
