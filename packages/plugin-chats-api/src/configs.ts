import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { NOTIFICATION_MODULES } from '../constants';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'chats',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },

  hasSubscriptions: true,

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
    notificationModules: NOTIFICATION_MODULES
  }
};
