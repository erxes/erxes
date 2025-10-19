import { startPlugin, wrapApolloResolvers } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { appRouter } from './init-trpc';
import { router } from './routes';

startPlugin({
  name: 'core',
  port: 3300,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: wrapApolloResolvers(resolvers),
  }),
  hasSubscriptions: true,
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },
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
  expressRouter: router,
});
