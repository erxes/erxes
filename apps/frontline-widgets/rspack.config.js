const { composePlugins, withNx, withReact } = require('@nx/rspack');
const rspack = require('@rspack/core');
const path = require('path');

module.exports = composePlugins(withNx(), withReact(), (config) => {

  // Define environment variables
  config.plugins = config.plugins || [];
  config.plugins.push(
    new rspack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:4000'),
    })
  );

  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    'erxes-ui': path.resolve(__dirname, '../../frontend/libs/erxes-ui/src'),
    '@libs': path.resolve(__dirname, 'src/lib'),
    '@': path.resolve(__dirname, 'src'),
  };

  // Configure dev server to serve static files from dist folder
  config.devServer = config.devServer || {};
  config.devServer.static = config.devServer.static || [];

  // Add the dist folder as a static directory
  if (Array.isArray(config.devServer.static)) {
    config.devServer.static.push({
      directory: path.resolve(__dirname, '../../dist/apps/frontline-widgets'),
      publicPath: '/',
      watch: false, // Disable watching to reduce file descriptors
    });
  }

  // Optimize watchOptions to reduce file descriptors
  config.watchOptions = {
    ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    poll: false, // Use native watching
  };

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
