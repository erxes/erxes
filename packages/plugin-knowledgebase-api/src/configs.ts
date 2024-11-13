import { getSubdomain } from '@erxes/api-utils/src/core';


import automations from './automations';
import { generateModels } from './connectionResolver';
import cronjobs from './crons/article';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import logs from './logUtils';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import webhooks from './webhooks';
import templates from './templates';

export default {
  name: 'knowledgebase',
  graphql: () => {
    return {
      typeDefs,
      resolvers,
    };
  },
  hasSubscriptions: false,
  permissions,
  segment: {},
  meta: {
    logs: { consumers: logs },
    webhooks,
    permissions,
    cronjobs,
    automations,
    templates
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  middlewares: [],

  onServerInit: async () => {
  },
  setupMessageConsumers,
};
