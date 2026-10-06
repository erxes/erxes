import { ModuleFederationConfig } from '@nx/rspack/module-federation';
import { withoutNpmAlias } from '../../module-federation.shared';

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
  name: 'payment_ui',
  exposes: {
    './config': './src/config.tsx',
    './paymentSettings': './src/modules/payment/Settings.tsx',
    './widgets': './src/widgets/Widgets.tsx',
    './relationWidget': './src/widgets/relation/RelationWidgets.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return withoutNpmAlias(defaultConfig);
    }

    // Returning false means the library is not shared.
    return false;
  },
};

export default config;
