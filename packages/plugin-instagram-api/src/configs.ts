import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import initApp from './initApp';
import { INTEGRATION_KINDS } from './constants';

export default {
  name: 'instagram',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },
  meta: {
    inboxIntegrations: [
      {
        kind: INTEGRATION_KINDS.MESSENGER,
        label: 'Instagram messenger'
      },
      {
        kind: INTEGRATION_KINDS.POST,
        label: 'Instagram post'
      }
    ]
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async () => {
    await initApp();
  },
  setupMessageConsumers
};
