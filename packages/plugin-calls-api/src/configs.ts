import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import webhookReceiver from './webhook';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import reports from './reports/reports';
import * as permissions from './permissions';
import cronjobs from './cronjobs/calls';

export default {
  name: 'calls',
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: {
    inboxIntegrations: [
      {
        kind: 'calls',
        label: 'Phone call',
      },
    ],
    logs: { providesActivityLog: true, consumers: logs },
    reports,
    permissions,
    cronjobs,
  },

  postHandlers: [{ path: '/webhook', method: webhookReceiver }],

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
