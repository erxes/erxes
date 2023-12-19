import { generateModels } from './connectionResolver';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { initBroker } from './messageBroker';
// import logs from './logUtils';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { exportCensusRunner } from './exporterByUrl';
import * as permissions from './permissions';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'inventories',
  permissions,
  getHandlers: [{ path: `/file-export-census`, method: exportCensusRunner }],
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  },

  meta: {
    permissions
  }
};
