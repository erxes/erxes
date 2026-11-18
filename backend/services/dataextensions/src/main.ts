import { startPlugin } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { resolvers } from '~/apollo/resolvers';
import { typeDefs } from '~/apollo/typeDefs';
import { initMQWorkers } from '~/worker';
import { dataExtensionsRouter } from '@/data-extensions/runtime/router';

/**
 * Data Extensions as its own service: the admin GraphQL for fields,
 * custom objects, views and webhooks, joined into the gateway's supergraph,
 * and each tenant's generated API at `/data-extensions/graphql`, which the
 * gateway proxies here when this service is enabled. Records stay with
 * their owners (core and plugins), reached over their tRPC contract.
 */
startPlugin({
  name: 'dataextensions',
  port: 3314,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  routerBeforeBodyParsers: dataExtensionsRouter,
  apolloServerContext: async (subdomain, context) => {
    context.models = await generateModels(subdomain, context);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async () => {
    await initMQWorkers();
  },
});
