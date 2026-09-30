// @ts-check

/**
 * Host-provided singletons — never bundled into the remote. Anything not in
 * this map is bundled normally so the remote stays self-contained.
 *
 * `import: false` marks erxes-ui / ui-modules: package.json installs only
 * their type declarations (@erxes/ui, @erxes/ui-modules); the remote always
 * consumes the host core-ui copy at runtime.
 *
 * This set MUST match the core-ui shared() list or the remote ships a second
 * copy of React/Apollo and breaks the host context.
 */
const hostShared = { singleton: true, requiredVersion: false };

const hostOnly = { ...hostShared, import: false };

/** @type {import('@module-federation/sdk').moduleFederationPlugin.ModuleFederationPluginOptions} */
const config = {
  name: 'changeme_ui',
  filename: 'remoteEntry.js',
  exposes: {
    './config': './src/config.tsx',
    './changemodule': './src/modules/changemodule/Main.tsx',
  },
  shared: {
    react: hostShared,
    'react-dom': hostShared,
    'react-router': hostShared,
    'react-router-dom': hostShared,
    '@apollo/client': hostShared,
    jotai: hostShared,
    'react-i18next': hostShared,
    'erxes-ui': hostOnly,
    'ui-modules': hostOnly,
  },
};

export default config;
