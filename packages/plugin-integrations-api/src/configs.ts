import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import initApp from '.';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import dashboards from './dashboards';

export let graphqlPubsub;
export let serviceDiscovery;

export let debug;
export let mainDb;

export default {
  name: 'integrations',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  hasSubscriptions: false,
  hasDashboard: true,
  meta: {
    dashboards
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    const app = options.app;

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    initApp(app);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
