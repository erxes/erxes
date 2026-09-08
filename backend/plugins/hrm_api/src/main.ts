import { startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { appRouter } from './init-trpc';
import { permissions } from './meta/permissions';

startPlugin({
  name: 'hrm',
  port: 3311,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),

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
  meta: {
    permissions,
  },
});
