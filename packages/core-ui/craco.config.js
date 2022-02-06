const path = require("path");
const fs = require('fs');
const cracoBabelLoader = require('craco-babel-loader');
const cracoModuleFederation = require('craco-module-federation');

const appDirectory = fs.realpathSync(process.cwd());
const resolvePackage = (relativePath) => path.resolve(appDirectory, relativePath);


module.exports = {
  plugins: [
    {
      plugin: cracoBabelLoader,
      options: {
        includes: [
          resolvePackage('src'),
          resolvePackage('../plugins'),
        ],
      },
    },
    {
      plugin: cracoModuleFederation,
    }
  ],
  webpack: {
    configure: webpackConfig => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve("path-browserify"),
        timers: require.resolve("timers-browserify")
      };

      return webpackConfig;
    },
  }
};