import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';

import afterMutations from './afterMutations';
import { generateModels } from './connectionResolver';
import forms from './forms';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as permissions from './permissions';

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
  hasSubscriptions: true,
  meta: {
    forms,
    permissions,
    afterMutations
  },

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers
    };

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;
    context.requestInfo = requestInfo;
    context.res = res;

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },
  middlewares: [cookieParser(), cpUserMiddleware],
  onServerInit: async options => {
    const app = options.app;
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
