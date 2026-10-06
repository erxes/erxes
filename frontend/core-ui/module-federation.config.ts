// @ts-check

/**
 * @type {import('@module-federation/sdk').moduleFederationPlugin.ModuleFederationPluginOptions}
 **/

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ModuleFederationConfig } from '@nx/rspack/module-federation';
import { withoutNpmAlias } from '../module-federation.shared';

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
  name: 'core-ui',

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return withoutNpmAlias(defaultConfig);
    }
    return false;
  },

  remotes: (process.env.ENABLED_PLUGINS?.split(',') ?? [])
    .map((plugin) => `${plugin}_ui`)
    .filter((remote) => existsSync(join(__dirname, '../plugins', remote))),
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
