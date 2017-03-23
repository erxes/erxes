/* eslint-disable */

var path = require('path');

module.exports = {
  entry: {
    inApp: './dist/inapp/index.js',
    inAppWidget: './dist/inapp/widget/index.js',
    chat: './dist/chat/index.js',
    chatWidget: './dist/chat/widget/index.js',
    form: './dist/form/index.js',
    formWidget: './dist/form/widget/index.js',
  },

  output: {
    path: path.join(__dirname, 'static'),
    filename: '[name].bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
        },
      },

      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },

      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },

      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
