const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.config');

module.exports = Merge(CommonConfig, {
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new UglifyJSPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 8,
        mangle: true,
        output: {
          comments: false,
          beautify: false,
        },
        compress: {
          warnings: false,
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
        warnings: false,
      },
    }),
  ],
})