import * as serverTiming from 'server-timing';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import logs from './logUtils';
import { generateModels } from './connectionResolver';
import internalNotes from './internalNotes';
import search from './search';
import { getSubdomain } from '@erxes/api-utils/src/core';

export default {
  name: 'growthhacks',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js'
  ),

  meta: {
    logs: { providesActivityLog: true, consumers: logs },
    internalNotes,
    search,
    permissions,
  },

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    return context;
  },
  middlewares: [(serverTiming as any)()],
  onServerInit: async () => {},
  setupMessageConsumers,
};
