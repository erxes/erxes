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
    './config': './src/config.ts',
    './ebarimt': './src/modules/ebarimt/Main.tsx',
    './ebarimtSettings': './src/modules/ebarimt/Settings.tsx',
    './widgets': './src/widgets/Widgets.tsx',
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
