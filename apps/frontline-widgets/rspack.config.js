const { composePlugins, withNx, withReact } = require('@nx/rspack');
const rspack = require('@rspack/core');
const path = require('path');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Configure dev server to serve static files from dist folder
  config.devServer = config.devServer || {};
  config.devServer.static = config.devServer.static || [];

  // Add the dist folder as a static directory
  if (Array.isArray(config.devServer.static)) {
    config.devServer.static.push({
      directory: path.resolve(__dirname, '../../dist/apps/frontline-widgets'),
      publicPath: '/',
      watch: true,
    });
  }

  // Also add CopyPlugin as fallback for production builds
  config.plugins = config.plugins || [];
  config.plugins.push(
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            '../../dist/apps/frontline-widgets/index.js',
          ),
          to: 'index.js',
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(
            __dirname,
            '../../dist/apps/frontline-widgets/index.js.map',
          ),
          to: 'index.js.map',
          noErrorOnMissing: true,
        },
      ],
    }),
  );

  return config;
});
