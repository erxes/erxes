import * as cookieParser from 'cookie-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { initBroker } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'discussions',
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.cpUser = req.cpUser;
    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
