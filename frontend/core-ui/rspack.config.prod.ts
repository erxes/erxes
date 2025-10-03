import { composePlugins, withNx, withReact } from '@nx/rspack';
import {
  ModuleFederationConfig,
  withModuleFederation,
} from '@nx/rspack/module-federation';

import baseConfig from './module-federation.config.prod';

const prodConfig: ModuleFederationConfig = {
  ...baseConfig,
};

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(prodConfig, { dts: false }),
);
