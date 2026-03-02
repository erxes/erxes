import { startPlugin } from 'erxes-api-shared/utils';
import express from 'express';
import path from 'path';
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
  subscriptionPluginPath: require('path').resolve(
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
    app.get('/widget/config.js', (req, res) => {
      res.type('application/javascript');
      res.send(`window.WIDGET_CONFIG = {
        API_URL: "${process.env.REACT_APP_API_URL}"
      };`);
    });

    app.use('/static', express.static(path.join(__dirname, '/public')));
    app.use('/widget', express.static(path.join(__dirname, '/public/widget')));
    app.get('/widget/*', (req, res) => {
      res.sendFile(path.join(__dirname, '/public/widget/index.html'));
    });
  },
});
