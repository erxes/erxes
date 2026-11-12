import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { resolve } from 'node:path';

const ui = resolve(__dirname, '../../packages/ui/src');

/**
 * Libraries shared with plugin UIs as single instances. Plugins built for old
 * core-ui declare the same names with `import: false`, so the host must
 * provide every one of them.
 */
const SHARED = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  '@apollo/client',
  'jotai',
  'react-i18next',
];

/**
 * The erxes core UI (apps/core-ui). Same-origin with the API: in development
 * the dev server forwards /core to apps/core-api; in production a reverse proxy
 * serves both under one address, so the session cookie stays first-party.
 * It is also the Module Federation host for plugin UIs (PUBLIC_PLUGINS).
 */
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'core',
      // The host exposes nothing and loads remotes at runtime, so there are no
      // federated types to build (the dts plugin also needs TypeScript 5's API).
      dts: false,
      shared: Object.fromEntries(
        SHARED.map((name) => [name, { singleton: true, requiredVersion: false }]),
      ),
    }),
  ],
  source: {
    entry: { index: './src/main.tsx' },
  },
  resolve: {
    alias: {
      '~': './src',
      // erxes-ui is compiled from source (packages/*), like core-ui does
      'erxes-ui$': `${ui}/index.ts`,
      'erxes-ui': ui,
    },
  },
  html: {
    title: 'erxes',
  },
  dev: {
    // Lazily compiled chunks break Module Federation shared singletons
    // ("factory is undefined" for react), so compile everything up front.
    lazyCompilation: false,
  },
  server: {
    port: Number(process.env.WEB_PORT) || 3500,
    proxy: {
      '/core': process.env.CORE_API_URL || 'http://localhost:3400',
    },
  },
  tools: {
    postcss: (_options, { addPlugins }) => addPlugins(tailwindcss()),
    rspack: {
      module: {
        rules: [
          // erxes-ui's ESM imports `dayjs/plugin/x` without an extension
          { test: /\.m?js$/, resolve: { fullySpecified: false } },
        ],
      },
    },
  },
});
