import { getSubdomain } from '@erxes/api-utils/src/core';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

// import { initBroker } from "./messageBroker";
// import init from "./controller";
import { generateModels } from './models';
import { initBroker, createRoutes } from './server';

export let mainDb;

export let debug;

export default {
  name: 'zalo',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  meta: {
    inboxIntegration: {
      kind: 'zalo',
      label: 'Zalo',
    },
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;
    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    debug = options.debug;

    console.log('options.messageBrokerClient', options.messageBrokerClient);

    initBroker(options.messageBrokerClient);
    createRoutes();
  },
};
