import { typeDefs } from './apollo/typeDefs';
import { appRouter } from './init-trpc';

import { startPlugin } from 'erxes-api-shared/utils';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';

startPlugin({
  name: 'pos',
  port: 3309,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: resolvers,
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
});
