import { composePlugins, withNx, withReact } from '@nx/rspack';
import {
  ModuleFederationConfig,
  withModuleFederation,
} from '@nx/rspack/module-federation';
import { DefinePlugin } from '@rspack/core';

import baseConfig from './module-federation.config';

const config: ModuleFederationConfig = {
  ...baseConfig,
};

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
  (config) => {
    // Define environment variables
    config.plugins?.push(
      new DefinePlugin({
        'process.env.REACT_APP_API_URL': JSON.stringify(
          process.env.REACT_APP_API_URL,
        ),

        'process.env.REACT_APP_IMAGE_CDN_URL': JSON.stringify(
          process.env.REACT_APP_IMAGE_CDN_URL,
        ),
        'process.env.ENABLED_PLUGINS': JSON.stringify(
          process.env.ENABLED_PLUGINS,
        ),
      }),
    );
    return config;
  },
);
