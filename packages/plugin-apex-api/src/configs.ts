import * as cookieParser from 'cookie-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { initBroker } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as permissions from './permissions';
import * as customCommand from './customCommand';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'apex',
  permissions,
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  hasSubscriptions: true,
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

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
