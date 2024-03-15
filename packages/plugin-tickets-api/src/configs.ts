import * as serverTiming from 'server-timing';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import forms from './forms';
import { generateModels } from './connectionResolver';
import search from './search';
import { getSubdomain } from '@erxes/api-utils/src/core';
import cronjobs from './cronjobs/common';
import logs from './logUtils';

import { NOTIFICATION_MODULES } from './constants';
import segments from './segments';
import tags from './tags';
import imports from './imports';
import internalNotes from './internalNotes';
import exporter from './exporter';

export default {
  name: 'tickets',
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
    cronjobs,
    forms,
    search,
    tags,
    segments,
    imports,
    exporter,
    permissions,
    internalNotes,
    logs: { providesActivityLog: true, consumers: logs },
    notificationModules: NOTIFICATION_MODULES,
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
