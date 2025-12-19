import { redis, startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { initMQWorkers } from './worker';

startPlugin({
  name: 'loyalty',
  port: 33010,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
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
    await initMQWorkers(redis);
  },
});
