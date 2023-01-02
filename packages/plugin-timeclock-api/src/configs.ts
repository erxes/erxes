import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import cronjobs from './cronjobs/timelock';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'timeclock',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  meta: {
    cronjobs
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;
    const app = options.app;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
