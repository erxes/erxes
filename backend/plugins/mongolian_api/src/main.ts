import {
  redis,
  startPlugin,
  wrapApolloResolvers,
} from 'erxes-api-shared/utils';
import { Router } from 'express';
import { typeDefs } from '~/apollo/typeDefs';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolver';

export const router: Router = Router();

startPlugin({
  name: 'mongolian',
  port: 3309,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: wrapApolloResolvers(resolvers),
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

  expressRouter: router,

  meta: {},
});
