// @ts-check

import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import mfConfig from './module-federation.config.mjs';

export default defineConfig({
  entry: './src/main.ts',
  devServer: {
    port: Number(process.env.PORT || __UI_PORT__),
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: './src/index.html' }),
    new ModuleFederationPlugin(mfConfig),
  ],
  experiments: { css: true },
  output: {
    uniqueName: 'changeme_ui',
    publicPath: 'auto',
  },
});
