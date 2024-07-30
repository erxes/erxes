const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.config');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(CommonConfig, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ie8: false,
          ecma: 8,
          mangle: true,
          output: {
            comments: false,
            beautify: false,
          },
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
    }),
  ],
});
