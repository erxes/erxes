/* eslint-disable */

var path = require('path');
var webpack = require('webpack');
require('dotenv').config();

const { ROOT_URL, API_SUBSCRIPTIONS_URL, API_GRAPHQL_URL, DDP_URL } = process.env;

module.exports = {
  entry: {
    messenger: './client/messenger/index.js',
    messengerWidget: './client/messenger/widget/index.js',
    form: './client/form/index.js',
    formWidget: './client/form/widget/index.js',
    knowledgeBaseWidget: './client/messenger/widget/index.js',
  },

  output: {
    path: path.join(__dirname, 'static'),
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'react'],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new webpack.DefinePlugin({
      ROOT_URL: JSON.stringify(ROOT_URL),
      API_SUBSCRIPTIONS_URL: JSON.stringify(API_SUBSCRIPTIONS_URL),
      API_GRAPHQL_URL: JSON.stringify(API_GRAPHQL_URL),
      DDP_URL: JSON.stringify(DDP_URL),
    }),
  ],
};
