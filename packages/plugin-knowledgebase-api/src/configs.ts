import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';

import { generateModels } from './connectionResolver';
import logs from './logUtils';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import webhooks from './webhooks';
import automations from './automations';
import cronjobs from './crons/article';
import templates from './templates';

export default {
  name: 'knowledgebase',
  graphql: () => {
    return {
      typeDefs,
      resolvers
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

  onServerInit: async () => { },
  setupMessageConsumers
};
