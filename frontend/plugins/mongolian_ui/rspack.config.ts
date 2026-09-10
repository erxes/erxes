import { composePlugins, withNx, withReact } from '@nx/rspack';
import { withModuleFederation } from '@nx/rspack/module-federation';

import baseConfig from './module-federation.config';

const config = {
  ...baseConfig,
};

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
  (config: import('@rspack/core').Configuration) => {
    if (process.env.NODE_ENV !== 'production') {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.nx/**',
          '**/coverage/**',
          '**/tmp/**',
          '**/.git/**',
        ],
      };
    }

    return config;
  },
);
