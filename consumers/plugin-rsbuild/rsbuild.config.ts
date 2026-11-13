import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// What apps/core-ui shares with plugin UIs. The fallbacks are built here, so
// every module erxes-ui's dist reaches has to resolve from the tarballs.
const SHARED = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  'react-router-dom',
  'erxes-ui',
  'jotai',
  'react-i18next',
];

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'consumer_ui',
      exposes: { './config': './src/config.tsx' },
      dts: false,
      shared: Object.fromEntries(
        SHARED.map((name) => [name, { singleton: true, requiredVersion: false }]),
      ),
    }),
  ],
  source: { entry: { index: './src/index.ts' } },
  // An import of a name the module does not export fails the build, not just warns.
  tools: { rspack: { module: { parser: { javascript: { exportsPresence: 'error' } } } } },
});
