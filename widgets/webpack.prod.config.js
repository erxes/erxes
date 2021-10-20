const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.config');

module.exports = Merge(CommonConfig, {
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new TerserPlugin({
      terserOptions: {
        ie8: false,
        ecma: 8,
        mangle: true,
        output: {
          comments: false,
          beautify: false
        },
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true
        }
      }
    })
  ]
});
