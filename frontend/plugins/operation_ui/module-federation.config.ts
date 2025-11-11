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
  name: 'operation_ui',
  exposes: {
    './config': './src/config.tsx',
    './operation': './src/modules/main/Main.tsx',
    './teamSettings': './src/modules/team/Settings.tsx',
    './relationWidget': './src/widgets/relation/RelationWidgets.tsx',
    './notificationWidget':
      './src/widgets/notifications/NotificationsWidgets.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }

    // Returning false means the library is not shared.
    return false;
  },
};

export default config;
