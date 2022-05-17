import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export let debug;

export default {
  name: 'clientportal',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  hasSubscriptions: false,
  segment: {},

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies
    };

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
    context.requestInfo = requestInfo;
    context.res = res;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
