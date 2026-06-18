import { getEnv, getSubdomain, startPlugin } from 'erxes-api-shared/utils';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { generateModels } from '~/connectionResolvers';
import { PAYMENTS } from '~/constants';
import { callbackHandler } from '~/apis/controller';
import { initPaymentsWorker } from './workers/payments';
import './bullmq-safe-patch';

const getWidgetApiUrl = (req: express.Request) => {
  const subdomain =
    getEnv({ name: 'VERSION' }) === 'saas' ? getSubdomain(req) : undefined;

  return getEnv({ name: 'REACT_APP_API_URL', subdomain }).replace(/\/$/, '');
};

const getWidgetBaseUrl = (req: express.Request) => {
  const apiUrl = getWidgetApiUrl(req);

  return `${apiUrl}/pl:payment/widget/`;
};

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
      const apiUrl = getWidgetApiUrl(req);

      res.type('application/javascript');
      res.send(`window.WIDGET_CONFIG = {
        API_URL: ${JSON.stringify(apiUrl)}
      };`);
    });

    const sendWidgetIndex = (req: express.Request, res: express.Response) => {
      const html = fs
        .readFileSync(path.join(__dirname, '/public/widget/index.html'), 'utf8')
        .split('/__PAYMENT_WIDGET_BASE__/')
        .join(getWidgetBaseUrl(req));

      res.type('html').send(html);
    };

    app.use('/static', express.static(path.join(__dirname, '/public')));
    app.use(
      '/widget',
      express.static(path.join(__dirname, '/public/widget'), { index: false }),
    );
    app.get('/widget', (req, res) => sendWidgetIndex(req, res));
    app.get('/widget/*', (req, res) => sendWidgetIndex(req, res));

    initPaymentsWorker();
  },
});
