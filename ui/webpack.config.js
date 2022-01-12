const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// replace accordingly './.env' with the path of your .env file
const envs = require("dotenv").config({ path: "./.env" });

const depNames = [
  '@apollo/react-hooks',
  'apollo-cache-inmemory',
  'apollo-client',
  'apollo-link',
  'apollo-link-context',
  'apollo-link-error',
  'apollo-link-http',
  'apollo-link-ws',
  'apollo-utilities',
  'color',
  // 'dayjs',
  'dotenv',
  'erxes-ui',
  'graphql',
  'graphql-tag',
  'i18n-react',
  'lodash',
  'lodash.flowright',
  'query-string',
  'react',
  'react-apollo',
  'react-bootstrap',
  'react-dom',
  'react-router-dom',
  'react-transition-group',
  'styled-components',
  'styled-components-ts',
  'subscriptions-transport-ws',
  'validator'
]

const shared = {};

for (const name of depNames) {
  shared[name] = { eager: true };
}

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  output: {
    publicPath: '/'
  },

  devServer: {
    port: 3000,
    historyApiFallback: true
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.json$/,
        use: {
          loader: "json-loader",
        },
      },
      {
        test: /node_modules\/vfile\/core\.js/,
        use: [{
          loader: 'imports-loader',
          options: {
            type: 'commonjs',
            imports: ['single process/browser process'],
          },
        }],
      },
    ],
  },

  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    fallback: { "path": require.resolve("path-browserify"), "timers": require.resolve("timers-browserify"), "util": require.resolve("util/") },
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },

  plugins: [
    new InterpolateHtmlPlugin({
      ...envs.parsed,
      PUBLIC_URL: ''
    }),
    new HtmlWebPackPlugin({
      template: path.resolve( __dirname, 'public/index.html' ),
      filename: 'index.html',
      inject: true,
    }),
    new ModuleFederationPlugin({
      name: "main",
      filename: "remoteEntry.js",
      exposes: {
        QuickNavigation: './src/modules/layout/components/QuickNavigation.tsx'
      },
      shared
    }),
  ],
};