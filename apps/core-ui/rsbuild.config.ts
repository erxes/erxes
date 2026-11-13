import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import reactCompiler from 'babel-plugin-react-compiler';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { resolve } from 'node:path';

const ui = resolve(import.meta.dirname, '../../packages/ui/src');

// oxlint-disable-next-line node/no-process-env -- a build tool's config: the dev server's port and API address come from the shell
const { WEB_PORT, CORE_API_URL } = process.env;

/**
 * Libraries shared with plugin UIs as single instances. Plugin UIs declare the
 * same names with `import: false`, so the host must provide every one of them.
 */
const SHARED = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  'jotai',
  'react-i18next',
  '@tanstack/react-query',
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
    // The React Compiler memoizes components and hooks, so a state change re-renders only
    // what reads it. Babel runs it on our own source before SWC; node_modules stay as shipped.
    pluginBabel({
      include: [resolve(__dirname, 'src'), ui],
      babelLoaderOptions: (options) => {
        options.plugins ??= [];
        options.plugins.unshift(reactCompiler);
      },
    }),
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
      // erxes-ui is compiled from its source in packages/ui
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
    port: Number(WEB_PORT) || 3500,
    proxy: {
      '/core': CORE_API_URL || 'http://localhost:3400',
    },
  },
  tools: {
    postcss: (_options, { addPlugins }) => addPlugins(tailwindcss()),
  },
});
