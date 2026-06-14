import { composePlugins, withNx, withReact } from '@nx/rspack';
import { withModuleFederation } from '@nx/rspack/module-federation';
import { config as baseConfig } from './module-federation.config';

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation({ ...baseConfig }, { dts: false }),
);
