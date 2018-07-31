var path = require('path');
var webpack = require('webpack');
var dotenv = require('dotenv');

dotenv.config();

var ROOT_URL = process.env.ROOT_URL;
var API_SUBSCRIPTIONS_URL = process.env.API_SUBSCRIPTIONS_URL;
var API_GRAPHQL_URL = process.env.API_GRAPHQL_URL;
var MAIN_API_URL = process.env.MAIN_API_URL;

module.exports = {
  entry: {
    messenger: './client/messenger/index.ts',
    messengerWidget: './client/messenger/widget/index.ts',
    form: './client/form/index.ts',
    formWidget: './client/form/widget/index.ts',
    knowledgebase: './client/knowledgebase/index.tsx',
    knowledgebaseWidget: './client/knowledgebase/widget/index.ts',
  },

  output: {
    path: path.join(__dirname, 'static'),
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      // addition - add source-map support
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: [/node_modules/]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000',
        exclude: [/node_modules/]
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: [/node_modules/]
      },
    ],
  },

  // addition - add source-map support
  devtool: "source-map",

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },

  plugins: [
    new webpack.DefinePlugin({
      ROOT_URL: JSON.stringify(ROOT_URL),
      API_SUBSCRIPTIONS_URL: JSON.stringify(API_SUBSCRIPTIONS_URL),
      API_GRAPHQL_URL: JSON.stringify(API_GRAPHQL_URL),
      MAIN_API_URL: JSON.stringify(MAIN_API_URL),
    }),
  ],
};
