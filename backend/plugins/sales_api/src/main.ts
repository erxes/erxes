import { startPlugin } from 'erxes-api-shared/utils';
import { appRouter } from './trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { typeDefs } from './apollo/typeDefs';
import { generateModels } from './connectionResolvers';

startPlugin({
  name: 'sales',
  port: 3305,
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
    const models = await generateModels(subdomain);

    context.models = models;

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
