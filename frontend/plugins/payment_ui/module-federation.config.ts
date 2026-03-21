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
    './widgets': './src/widgets/Widgets.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    // 🔥 make core libs singleton
    if (coreLibraries.has(libraryName)) {
      return {
        ...defaultConfig,
        singleton: true,
        requiredVersion: false,
      };
    }

    // 🔥 CRITICAL FIX: share your context file
    if (libraryName === './src/widgets/hooks/use-payment') {
      return {
        singleton: true,
      };
    }

    return false;
  },
};

export default config;