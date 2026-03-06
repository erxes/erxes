const { composePlugins, withNx, withReact } = require('@nx/rspack');
const rspack = require('@rspack/core');
const path = require('path');

module.exports = composePlugins(withNx(), withReact(), (config: any) => {
  // Define environment variables
  config.plugins = config.plugins || [];
  config.plugins.push(
    new rspack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL || 'http://localhost:4000',
      ),
    }),
  );
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
            '../../dist/apps/frontline-widgets/messenger-widget.js',
          ),
          to: 'messenger-widget.js',
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(
            __dirname,
            '../../dist/apps/frontline-widgets/messenger-widget.js.map',
          ),
          to: 'messenger-widget.js.map',
          noErrorOnMissing: true,
        },
      ],
    }),
  );

  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, './src'),
    '@libs': path.resolve(__dirname, './src/lib'),
  };

  // Configure CSS processing with PostCSS for Tailwind CSS
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  // Find and replace existing CSS rule or add new one
  const cssRuleIndex = config.module.rules.findIndex(
    (rule: any) =>
      rule &&
      typeof rule === 'object' &&
      rule.test &&
      rule.test.toString().includes('css'),
  );

  const cssRule = {
    test: /\.css$/,
    use: ['postcss-loader'],
    type: 'css',
  };

  if (cssRuleIndex >= 0) {
    config.module.rules[cssRuleIndex] = cssRule;
  } else {
    config.module.rules.push(cssRule);
  }

  return config;
});
