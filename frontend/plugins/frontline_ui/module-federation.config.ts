import { ModuleFederationConfig } from '@nx/rspack/module-federation';

const coreLibraries = new Set([
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  '@apollo/client',
  'jotai',
  'ui-modules',
  'react-i18next',
]);

const config: ModuleFederationConfig = {
  name: 'frontline_ui',
  exposes: {
    './config': './src/config.tsx',
    './frontline': './src/modules/Main.tsx',
    './configsSettings': './src/modules/integrations-config/Settings.tsx',
    './ticketSettings': './src/modules/ticket/Settings.tsx',
    './channelsSettings': './src/modules/channels/Settings.tsx',
    './automationsWidget':
      './src/widgets/automations/components/AutomationRemoteEntry.tsx',
    './notificationWidget':
      './src/widgets/notifications/NotificationRemoteEntries.tsx',
    './relationWidget': './src/widgets/RelationWidget.tsx',
    './floatingWidget': './src/widgets/FloatingWidget.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }

    // Returning false means the library is not shared.
    return false;
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
