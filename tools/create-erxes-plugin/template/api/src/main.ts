import 'dotenv/config';
import { typeDefs } from './apollo/typeDefs';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { startPlugin } from 'erxes-api-shared/utils';
import { permissions } from './meta/permissions';
import { notifications } from './meta/notifications';
import { appRouter, createTRPCContext } from './trpc/init-trpc';

startPlugin({
  name: 'changeme',
  port: __API_PORT__,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    context.models = await generateModels(subdomain);
    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      context.models = await generateModels(subdomain);
      return context;
    },
  },
  meta: {
    permissions,
    notifications,
  },
});
