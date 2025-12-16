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
  name: 'sales_ui',
  exposes: {
    './config': './src/config.tsx',
    './sales': './src/modules/Main.tsx',
    './dealsSettings': './src/pages/SettingsPage.tsx',
    './Widgets': './src/widgets/Widgets.tsx',
    './relationWidget': './src/widgets/relation/RelationWidgets.tsx',
    './posSettings': './src/modules/pos/pos/Settings.tsx',
    './automationsWidget':
      './src/widgets/automations/components/AutomationRemoteEntry.tsx',
      './goals': './src/modules/goals/Main.tsx',
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
