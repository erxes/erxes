import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import logs from './logUtils';
import automations from './automations';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';

export default {
  name: 'loyalties',
  permissions,
  meta: {
    logs: { consumers: logs },

    automations,
    // for fixing permissions
    permissions,
  },
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },
  onServerInit: async () => {},
  setupMessageConsumers,
};
