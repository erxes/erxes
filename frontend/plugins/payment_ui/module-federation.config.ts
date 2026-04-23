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
  '@stripe/react-stripe-js',
  '@stripe/stripe-js',
]);

const config: ModuleFederationConfig = {
  name: 'payment_ui',

  exposes: {
    './config': './src/config.tsx',
    './paymentSettings': './src/modules/payment/Settings.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return {
        ...defaultConfig,
        singleton: true,
        requiredVersion: false,
      };
    }
    return false;
  },
};

export default config;
