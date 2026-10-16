import { composePlugins, withNx, withReact } from '@nx/rspack';
import {
  ModuleFederationConfig,
  withModuleFederation,
} from '@nx/rspack/module-federation';
import { DefinePlugin } from '@rspack/core';
import { resolve } from 'path';

import baseConfig from './module-federation.config';

const config: ModuleFederationConfig = {
  ...baseConfig,
};

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, {
    dts: false,
    runtimePlugins:
      process.env.NODE_ENV === 'production'
        ? []
        : [resolve(__dirname, 'src/devRemotesRuntimePlugin.ts')],
  }),
  (config: any) => {
    // Define environment variables
    config.plugins?.push(
      new DefinePlugin({
        'process.env.REACT_APP_API_URL': JSON.stringify(
          process.env.REACT_APP_API_URL,
        ),

        'process.env.REACT_APP_IMAGE_CDN_URL': JSON.stringify(
          process.env.REACT_APP_IMAGE_CDN_URL,
        ),
        'process.env.ENABLED_PLUGINS': JSON.stringify(
          process.env.ENABLED_PLUGINS,
        ),

        'process.env.REACT_APP_GOOGLE_MAP_API_KEY': JSON.stringify(
          process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        ),

        'process.env.REACT_APP_HIDE_CORE_MODULES': JSON.stringify(
          process.env.REACT_APP_HIDE_CORE_MODULES,
        ),

        'process.env.REACT_APP_SENTRY_DSN': JSON.stringify(
          process.env.REACT_APP_SENTRY_DSN,
        ),
        'process.env.REACT_APP_SENTRY_ENVIRONMENT': JSON.stringify(
          process.env.REACT_APP_SENTRY_ENVIRONMENT,
        ),
      }),
    );

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.css$/,
      use: ['postcss-loader'],
      type: 'css',
    });

    config.devServer = {
      ...config.devServer,
      allowedHosts: 'all',
      client: {
        ...config.devServer?.client,
        logging: 'error',
      },
      devMiddleware: {
        ...config.devServer?.devMiddleware,
        stats: 'errors-warnings',
      },
    };

    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: 'error',
    };

    config.stats = 'errors-warnings';

    if (process.env.NODE_ENV !== 'production') {
      // Pairs with src/devRemotesRuntimePlugin.ts, which points remotes here.
      config.devServer.proxy = [
        ...(config.devServer.proxy ?? []),
        {
          context: ['/__remotes'],
          target: 'http://localhost',
          router: (req: { url: string }) =>
            `http://localhost:${req.url.split('/')[2]}`,
          pathRewrite: { '^/__remotes/\\d+': '' },
        },
      ];

      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/dist/**', '**/.nx/**'],
      };
    }

    return config;
  },
);
