import { startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { afterProcess } from '~/meta/afterProcess';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';

startPlugin({
  name: 'mongolian',
  port: 3307,
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production'
      ? 'subscription.js'
      : 'subscription.ts',
  ),
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
  meta: {
    afterProcess,
  }
});
