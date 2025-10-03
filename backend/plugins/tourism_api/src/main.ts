import { startPlugin } from 'erxes-api-shared/utils';
import { appRouter } from '~/trpc/init-trpc';

import { generateModels } from './connectionResolvers';
import { typeDefs } from './apollo/typeDefs';
import resolvers from './apollo/resolvers';

startPlugin({
  name: 'tourism',
  port: 3308,
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
