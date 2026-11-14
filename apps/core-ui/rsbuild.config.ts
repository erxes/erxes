import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import reactCompiler from 'babel-plugin-react-compiler';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
// Plugin UIs declare the same list with `import: false`, so the host provides every one.
import { SHARED } from 'erxes-ui/federation';
import { resolve } from 'node:path';
import { pluginBundleBudget } from './bundleBudget';

const ui = resolve(import.meta.dirname, '../../packages/ui/src');

// The dev server's port and API address come from the shell.
const { WEB_PORT, CORE_API_URL } = process.env;

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
      include: [resolve(import.meta.dirname, 'src'), ui],
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
    pluginBundleBudget(),
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
    // The erxes "X" mark (OrgLogoIcon) on the brand colour, `--primary`.
    favicon: './src/favicon.svg',
    meta: {
      // BlockNote keeps its toolbar above a phone's virtual keyboard only when the
      // keyboard resizes the page.
      viewport: 'width=device-width, initial-scale=1, interactive-widget=resizes-content',
    },
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
