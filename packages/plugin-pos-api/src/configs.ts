import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import {
  posInit,
  posSyncConfig,
  posSyncOrders,
  unfetchOrderInfo
} from './routes';
import afterMutations from './afterMutations';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'pos',
  permissions,
  getHandlers: [
    { path: `/pos-init`, method: posInit },
    { path: `/pos-sync-config`, method: posSyncConfig }
  ],
  postHandlers: [
    { path: `/api/unfetch-order-info`, method: unfetchOrderInfo },
    { path: `/pos-sync-orders`, method: posSyncOrders }
  ],
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
    afterMutations
  }
};
