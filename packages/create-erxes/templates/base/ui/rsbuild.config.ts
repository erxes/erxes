import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import reactCompiler from 'babel-plugin-react-compiler';
// What core-ui shares. The host provides each one (`import: false`), so the plugin
// never bundles a second React, router, query client or erxes-ui.
import { SHARED } from 'erxes-ui/federation';

export default defineConfig({
  plugins: [
    pluginReact(),
    // The React Compiler memoizes components and hooks; it runs on our source before SWC.
    pluginBabel({
      include: /[\\/]src[\\/]/,
      babelLoaderOptions: (options) => {
        options.plugins ??= [];
        options.plugins.unshift(reactCompiler);
      },
    }),
    pluginModuleFederation({
      name: '__id___ui',
      filename: 'remoteEntry.js',
      exposes: { './config': './src/config.tsx', './__id__': './src/__Pascal__.tsx' },
      dts: false,
      shared: Object.fromEntries(
        SHARED.map((name) => [name, { singleton: true, requiredVersion: false, import: false }]),
      ),
    }),
  ],
  source: { entry: { index: './src/index.ts' } },
  // Chunks load from wherever remoteEntry.js came from, not from core-ui's origin.
  output: { assetPrefix: 'auto' },
  dev: { assetPrefix: true, lazyCompilation: false },
  server: { port: Number(process.env.UI_PORT) || __uiPort__, cors: { origin: '*' } },
});
