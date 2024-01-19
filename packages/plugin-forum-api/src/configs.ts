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
import cronjobs from './cronjobs';
import tags from './tags';
import { generateAllDataLoaders } from './graphql/dataloaders';

export let mainDb;
export let debug;

export default {
  name: 'forum',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  hasSubscriptions: false,

  meta: {
    cronjobs,
    tags,
  },

  apolloServerContext: async (context, req, res): Promise<IContext> => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    context.dataLoaders = generateAllDataLoaders(context.models, subdomain);

    return context;
  },
  middlewares: [(serverTiming as any)(), cookieParser(), cpUserMiddleware],
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  },
};
