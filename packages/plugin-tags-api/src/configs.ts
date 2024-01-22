import * as serverTiming from 'server-timing';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { initBroker } from './messageBroker';
import logs from './logUtils';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import dashboards from './dashboards';

export let debug;
export let mainDb;

export default {
  name: 'tags',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    return context;
  },
  middlewares: [(serverTiming as any)()],

  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker();

    debug = options.debug;
  },

  meta: { logs: { consumers: logs }, permissions, dashboards },
};
