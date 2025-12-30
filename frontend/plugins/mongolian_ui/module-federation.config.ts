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
    './sync-erkhetSettings': './src/modules/erkhet-sync/Settings.tsx',
    './sync-erkhet-history':
      './src/modules/erkhet-sync/sync-erkhet-history/Main.tsx',
    './check-synced-deals':
      './src/modules/erkhet-sync/check-synced-deals/Main.tsx',
    './check-pos-orders': './src/modules/erkhet-sync/check-pos-orders/Main.tsx',
    './check-category': './src/modules/erkhet-sync/check-category/Main.tsx',
    './check-products': './src/modules/erkhet-sync/check-products/Main.tsx',
    './put-response': './src/modules/put-response/Main.tsx',
    './put-responses-by-date':
      './src/modules/put-response/put-responses-by-date/Main.tsx',
    './put-responses-duplicated':
      './src/modules/put-response/put-responses-duplicated/Main.tsx',
    './widgets': './src/widgets/Widgets.tsx',
     './productplaces': './src/modules/productplaces/Main.tsx',
     './productplacesSettings':
      './src/pages/productplaces/ProductPlacesSettings.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
       return {
        ...defaultConfig,
        // Ensure singleton for React Router
        singleton: true,
        requiredVersion: false,
        eager: true,
      };

    }

    return false;
  },
};

export default config;
