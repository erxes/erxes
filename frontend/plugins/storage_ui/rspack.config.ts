import { composePlugins, withNx, withReact } from '@nx/rspack';
import { withModuleFederation } from '@nx/rspack/module-federation';

import { config as baseConfig } from './module-federation.config';

const config = {
  ...baseConfig,
};

// Default export required by Nx/Rspack tooling - do not remove
export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
);
