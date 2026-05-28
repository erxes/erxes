import { appRouter } from './trpc/init-trpc';
import automations from './meta/automations';
import { generateModels } from './connectionResolvers';
import resolvers from './apollo/resolvers';
import segments from './meta/segments';
import { startPlugin } from 'erxes-api-shared/utils';
import { afterProcess } from './meta/afterProcess';
import { typeDefs } from './apollo/typeDefs';
import { notifications } from './meta/notifications';
import { permissions } from '~/meta/permissions';

startPlugin({
  name: 'branched',
  port: 3315,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);
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
  onServerInit: async () => {},
  meta: {
    automations,
    segments,
    permissions,
    notifications,
    afterProcess,
  } as any,
});
