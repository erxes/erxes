import { resolve } from 'node:path';
import { startPlugin } from 'erxes-api-shared/utils';
import { startMessagingWorker } from '@/messaging/worker';
import { typeDefs } from '~/apollo/typeDefs';
import { resolvers } from '~/apollo/resolvers';
import { router } from '~/routes';
import { agent } from '~/meta/agent';
import { permissions } from '~/meta/permissions';

startPlugin({
  name: 'communication',
  port: 3306,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),

  hasSubscriptions: true,
  subscriptionPluginPath: resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production'
      ? 'subscription.js'
      : 'subscription.ts',
  ),

  expressRouter: router,
  onServerInit: async () => {
    startMessagingWorker();
  },

  // Modules authenticate their own callers and generate tenant models from
  // verified credentials, so the shared request context is passed through.
  apolloServerContext: async (_subdomain, context) => context,

  meta: {
    permissions,
    agent,
  },
});
