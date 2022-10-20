import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';

import afterMutations from './afterMutations';
import { generateModels } from './connectionResolver';
import cpUserMiddleware from './cpUserMiddleware';
import forms from './forms';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import * as permissions from './permissions';
import segments from './segments';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'tumentech',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers()
    };
  },

  meta: {
    segments,
    forms,
    afterMutations
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },
  middlewares: [cookieParser(), cpUserMiddleware],
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
