import { redis, startPlugin } from 'erxes-api-shared/utils';
import resolvers from '~/apollo/resolvers';
import { typeDefs } from '~/apollo/typeDefs';
import { generateModels } from '~/connectionResolvers';
import { appRouter } from '~/trpc/init-trpc';
import { initMQWorkers } from '~/worker';

startPlugin({
  name: 'loyalty',
  port: 3309,
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
