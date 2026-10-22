import { composePlugins, withNx, withReact } from '@nx/rspack';
import {
  ModuleFederationConfig,
  withModuleFederation,
} from '@nx/rspack/module-federation';

import { DefinePlugin } from '@rspack/core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import baseConfig from './module-federation.config.prod';

// Platform version plugins declare compatibility against (`platform` in CONFIG).
const ERXES_VERSION: string = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf8'),
).version;

const prodConfig: ModuleFederationConfig = {
  ...baseConfig,
};

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(prodConfig, { dts: false }),
  (config) => {
    config.plugins?.push(
      new DefinePlugin({
        'process.env.ERXES_VERSION': JSON.stringify(ERXES_VERSION),
      }),
    );
    return config;
  },
);
