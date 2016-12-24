/* eslint-disable */

var path = require('path');

module.exports = {
  entry: {
    inApp: './client/inapp/index.js',
    inAppWidget: './client/inapp/widget.js',
  },

  output: {
    path: path.join(__dirname, 'client/build'),
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
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },

      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },

  watch: true,

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
