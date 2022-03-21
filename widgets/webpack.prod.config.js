const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.config');

module.exports = Merge(CommonConfig, {
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new UglifyJSPlugin({
      test: /\.js($|\?)/i,
      sourceMap: true,
      uglifyOptions: {
        mangle: {
          keep_fnames: true,
        },
        compress: {
          warnings: false,
        },
        output: {
          beautify: false,
        },
      },
    }),
  ],
})