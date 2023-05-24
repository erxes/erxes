const webpack = require("webpack");
const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { MFLiveReloadPlugin } = require('@module-federation/fmr');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// replace accordingly './.env' with the path of your .env file
const envs = require('dotenv').config({ path: './.env' });

const depNames = [
  '@apollo/client',
  'color',
  'dotenv',
  'graphql',
  'lodash',
  'lodash.flowright',
  'query-string',
  'react-bootstrap',
  'react-dom',
  'react-router-dom',
  'react-transition-group',
  'styled-components',
  'styled-components-ts'
];

const deps = require('./package.json').dependencies;
const shared = {};

for (const name of depNames) {
  shared[name] = { eager: true, singleton: true, requiredVersion: deps[name] };
}

module.exports = (env, args) => {
  return {
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
    },
    output: {
      publicPath: '/',
      chunkFilename: '[id].[contenthash].js'
    },

    devServer: {
      port: 3000,
      allowedHosts: 'all',
      historyApiFallback: true
    },

    module: {
      rules: [
        {
          test: /\.m?js/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false
          }
        },
        {
          test: /\.(css|s[ac]ss)$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, '../erxes-ui/src'),
            path.resolve(__dirname, '../ui-settings/src'),
            path.resolve(__dirname, '../ui-engage/src'),
            path.resolve(__dirname, '../ui-contacts/src'),
            path.resolve(__dirname, '../ui-segments/src'),
            path.resolve(__dirname, '../ui-forms/src'),
            path.resolve(__dirname, '../ui-inbox/src'),
            path.resolve(__dirname, '../ui-products/src'),
            path.resolve(__dirname, '../ui-cards/src'),
            path.resolve(__dirname, '../ui-knowledgebase/src'),
            path.resolve(__dirname, '../ui-notifications/src'),
            path.resolve(__dirname, '../ui-calendar/src'),
            path.resolve(__dirname, '../ui-log/src'),
            path.resolve(__dirname, '../ui-internalnotes/src'),
            path.resolve(__dirname, '../ui-leads/src'),
            path.resolve(__dirname, '../ui-tags/src')
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-typescript',
                '@babel/preset-react',
                '@babel/preset-env'
              ],
              plugins: [['@babel/transform-runtime']]
            }
          }
        },
        {
          test: /\.json$/,
          use: {
            loader: 'json-loader'
          }
        }
      ]
    },

    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      fallback: {
        path: require.resolve('path-browserify'),
        timers: require.resolve('timers-browserify'),
        util: require.resolve('util/')
      },
      alias: {
        'coreui/apolloClient': path.resolve(__dirname, './src/apolloClient.ts'),
        'coreui/utils': path.resolve(__dirname, './src/modules/common/utils'),
        'coreui/pluginUtils': path.resolve(__dirname, './src/pluginUtils'),
        'coreui/appContext': path.resolve(__dirname, './src/appContext'),
        'coreui/withPermission': path.resolve(
          __dirname,
          './src/modules/common/components/WithPermission'
        )
      },
      extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
    },

    plugins: [
      new InterpolateHtmlPlugin({
        ...envs.parsed,
        PUBLIC_URL: ''
      }),
      new NodePolyfillPlugin({
        includeAliases: ['process']
      }),
      new HtmlWebPackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        filename: 'index.html',
        inject: true
      }),
      new ModuleFederationPlugin({
        name: 'coreui',
        filename: 'remoteEntry.js',
        exposes: {
          './appContext': './src/appContext',
          './apolloClient': './src/apolloClient',
          './withPermission': './src/modules/common/components/WithPermission',
          './utils': './src/modules/common/utils',
          './pluginUtils': './src/pluginUtils'
        },
        shared: {
          ...shared,
          '@erxes/ui': {
            requiredVersion: '1.0.0',
            singleton: true
          },
          dayjs: {
            requiredVersion: deps['dayjs'],
            singleton: true
          },
          react: {
            requiredVersion: deps['react'],
            singleton: true,
            eager: true
          },
          './src/appContext': {},
          './src/apolloClient': {},
          './src/modules/common/components/WithPermission': {},
          './src/modules/common/utils': {},
          './src/pluginUtils': {}
        }
      }),
      args.mode === 'development'
        ? new MFLiveReloadPlugin({
            port: 3000, // the port your app runs on
            container: 'coreui', // the name of your app, must be unique
            standalone: false // false uses chrome extention
          })
        : false
    ].filter(Boolean)
  };
};
