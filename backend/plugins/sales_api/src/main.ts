import { appRouter } from './trpc/init-trpc';
import automations from './meta/automations';
import { generateModels } from './connectionResolvers';
import resolvers from './apollo/resolvers';
import { router } from './routes';
import segments from './meta/segments';
import { startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from './apollo/typeDefs';
import { createLoaders } from './modules/sales/graphql/resolvers/loaders';

startPlugin({
  name: 'sales',
  port: 3305,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  expressRouter: router,
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
    context.loaders = createLoaders(subdomain, models);

    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },
  onServerInit: async () => {
    // await initMQWorkers(redis);
  },
  meta: {
    automations,
    segments,
    tags: { types: [{ type: 'deal', description: 'Sales' }] },
    notificationModules: [
      {
        name: 'deals',
        description: 'Deals',
        icon: 'IconChecklist',
        types: [
          { name: 'dealAssignee', text: 'Deal assignee' },
          { name: 'dealStatus', text: 'Deal status changed' },
        ],
      },
      {
        name: 'note',
        description: 'Note',
        icon: 'IconNote',
        types: [{ name: 'note', text: 'Mentioned in note' }],
      },
    ],
  },
});
