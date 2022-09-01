import * as serverTiming from 'server-timing';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as cookieParser from 'cookie-parser';
import { initBroker, sendSegmentsMessage } from './messageBroker';
import * as permissions from './permissions';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { getSubdomain } from '@erxes/api-utils/src/core';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import { generateModels } from './db/models';
import { IContext } from './graphql';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'forum',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  hasSubscriptions: false,

  meta: {},

  apolloServerContext: async (context, req, res): Promise<IContext> => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric
    };

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },
  middlewares: [(serverTiming as any)(), cookieParser(), cpUserMiddleware],
  onServerInit: async options => {
    mainDb = options.db;

    const app = options.app;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
