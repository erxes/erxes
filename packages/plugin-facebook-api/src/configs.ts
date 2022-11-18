import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initMemoryStorage } from './inmemoryStorage';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import initApp from './index';
import { INTEGRATION_KINDS } from './constants';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'facebook',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  meta: {
    inboxIntegrations: [
      {
        kind: INTEGRATION_KINDS.MESSENGER,
        label: 'Facebook messenger'
      },
      {
        kind: INTEGRATION_KINDS.POST,
        label: 'Facebook post'
      }
    ]
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

    initMemoryStorage();

    initBroker(options.messageBrokerClient);

    initApp(app);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
