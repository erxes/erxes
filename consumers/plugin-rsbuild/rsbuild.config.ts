import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// web's shared list, from the tarball. The fallbacks are built here, so every
// module erxes-ui's dist reaches has to resolve from the tarballs.
import { SHARED } from 'erxes-ui/federation';

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
