import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const uiDir = path.dirname(fileURLToPath(import.meta.url));
// The remote's name in the host. Also the chunk-loading global, so two
// extensions' chunks never overwrite each other in the page.
const name = 'dealFollowups_ui';

// The erxes host provides these. The remote never bundles its own copy.
const hostLibraries = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  'ui-modules',
  'jotai',
  '@apollo/client',
  'react-i18next',
  'react-hook-form',
];

/** @type {import('@rspack/core').Configuration} */
export default {
  mode: 'production',
  context: uiDir,
  entry: {},
  output: {
    path: path.join(uiDir, 'dist'),
    publicPath: 'auto',
    uniqueName: name,
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      // CSS built by ext-css, injected as text by the UI.
      { resourceQuery: /raw/, type: 'asset/source' },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename: 'remoteEntry.js',
      dts: false,
      exposes: {
        './config': './src/config.tsx',
        './dealFollowups': './src/remote.ts',
        './followUpButton': './src/FollowUpButton.tsx',
      },
      shared: Object.fromEntries(
        hostLibraries.map((name) => [
          name,
          { singleton: true, import: false, requiredVersion: false },
        ]),
      ),
    }),
  ],
};
