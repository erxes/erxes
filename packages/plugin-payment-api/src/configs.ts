import { getSubdomain } from '@erxes/api-utils/src/core';
import { POST_CALLBACK_TYPES } from '../constants';

import { generateModels } from './connectionResolver';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import { getHandler, postHandler } from './utils';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'payment',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  hasSubscriptions: true,

  getHandlers: [{ path: `/callback`, method: getHandler }],

  postHandlers: POST_CALLBACK_TYPES.ALL.map(type => ({
    path: `/callback/${type}`,
    method: postHandler
  })),

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
