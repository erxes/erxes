import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'automations',
  permissions,
  // for fixing permissions
  meta: { permissions },
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    console.log('on server init .....');

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
