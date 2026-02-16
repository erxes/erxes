import { startPlugin } from 'erxes-api-shared/utils';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { generateModels } from '~/connectionResolvers';
import { PAYMENTS } from '~/constants';
import { callbackHandler } from '~/apis/controller';

startPlugin({
  name: 'payment',
  port: 3310,

  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),

  hasSubscriptions: true,

  subscriptionPluginPath: path.resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production'
      ? 'subscription.js'
      : 'subscription.ts',
  ),

  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);
    context.models = models;
    context.subdomain = subdomain;
    return context;
  },

  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);
      context.models = models;
      context.subdomain = subdomain;
      return context;
    },
  },

  apiHandlers: PAYMENTS.ALL.flatMap((kind) => [
    {
      path: `/callback/${kind}`,
      method: 'GET',
      resolver: callbackHandler,
    },
    {
      path: `/callback/${kind}`,
      method: 'POST',
      resolver: callbackHandler,
    },
  ]),

  onServerInit: async (app) => {
    // Dev: __dirname = src
    // Prod: __dirname = dist/src
    const publicPath = path.resolve(__dirname, 'public');
    const widgetPath = path.resolve(publicPath, 'widget');

    // Serve static files
    app.use('/', express.static(publicPath));

    // Optional widget
    if (fs.existsSync(widgetPath)) {
      app.use('/widget', express.static(widgetPath));

      app.get('/widget/*', (req, res) => {
        res.sendFile(path.resolve(widgetPath, 'index.html'));
      });
    }
  },
});
