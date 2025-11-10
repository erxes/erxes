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
  name: 'mongolian_ui',
  exposes: {
    './config': './src/config.tsx',
    './ebarimt': './src/modules/ebarimt/Main.tsx',
    './ebarimtSettings':
      './src/modules/ebarimt/settings/components/EBarimtSettings.tsx',
    './put-response': './src/modules/put-response/Main.tsx',
    './by-date': './src/modules/by-date/Main.tsx',
    './duplicated': './src/modules/duplicated/Main.tsx',
    './widgets': './src/widgets/Widgets.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }

    return false;
  },
};

export default config;
